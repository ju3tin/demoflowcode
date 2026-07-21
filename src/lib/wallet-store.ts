import { create } from "zustand";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
} from "viem";
import { avalancheFuji, avalanche } from "viem/chains";

export { avalancheFuji, avalanche };

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

function getProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

interface WalletState {
  address: Address | null;
  chainId: number | null;
  connecting: boolean;
  error: string | null;

  connect: () => Promise<void>;
  disconnect: () => void;
  switchToFuji: () => Promise<void>;
  clearError: () => void;
  _initListeners: () => void;
}

let listenersInitialized = false;

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  chainId: null,
  connecting: false,
  error: null,

  connect: async () => {
    const provider = getProvider();
    if (!provider) {
      set({
        error:
          "No wallet found. Install MetaMask or Core to connect.",
      });
      return;
    }
    set({ connecting: true, error: null });
    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      const chainIdHex = (await provider.request({
        method: "eth_chainId",
      })) as string;
      set({
        address: (accounts[0] as Address) ?? null,
        chainId: parseInt(chainIdHex, 16),
        connecting: false,
      });
      get()._initListeners();
    } catch (e) {
      set({
        connecting: false,
        error: e instanceof Error ? e.message : "Connection was rejected.",
      });
    }
  },

  disconnect: () => set({ address: null, chainId: null, error: null }),

  switchToFuji: async () => {
    const provider = getProvider();
    if (!provider) return;
    const fujiHex = `0x${avalancheFuji.id.toString(16)}`;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: fujiHex }],
      });
    } catch (switchError) {
      const err = switchError as { code?: number };
      if (err?.code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: fujiHex,
                chainName: avalancheFuji.name,
                nativeCurrency: avalancheFuji.nativeCurrency,
                rpcUrls: [avalancheFuji.rpcUrls.default.http[0]],
                blockExplorerUrls: [avalancheFuji.blockExplorers.default.url],
              },
            ],
          });
        } catch (addError) {
          set({
            error:
              addError instanceof Error
                ? addError.message
                : "Failed to add Fuji network.",
          });
        }
      } else {
        set({
          error:
            switchError instanceof Error
              ? switchError.message
              : "Failed to switch network.",
        });
      }
    }
  },

  clearError: () => set({ error: null }),

  _initListeners: () => {
    if (listenersInitialized) return;
    const provider = getProvider();
    if (!provider?.on) return;
    listenersInitialized = true;
    provider.on("accountsChanged", (...args: unknown[]) => {
      const accounts = args[0] as string[];
      useWalletStore.setState({ address: (accounts?.[0] as Address) ?? null });
    });
    provider.on("chainChanged", (...args: unknown[]) => {
      const hex = args[0] as string;
      useWalletStore.setState({ chainId: parseInt(hex, 16) });
    });
  },
}));

export function getViemWalletClient(address: Address) {
  const provider = getProvider();
  if (!provider) throw new Error("No wallet found");
  return createWalletClient({
    account: address,
    chain: avalancheFuji,
    transport: custom(provider),
  });
}

export function getViemPublicClient() {
  return createPublicClient({
    chain: avalancheFuji,
    transport: http(),
  });
}
