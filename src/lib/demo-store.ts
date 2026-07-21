import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Demo Mode — a recording-friendly toggle that swaps the Assistant and
 * Audit panels (the only two surfaces that make real Anthropic API calls)
 * for scripted, deterministic mock responses with realistic timing.
 *
 * Nothing else reads this flag: canvas, compiler, wallet, and the real
 * compile/deploy path are untouched regardless of its value.
 */
interface DemoState {
  demoMode: boolean;
  setDemoMode: (on: boolean) => void;
  toggleDemoMode: () => void;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      demoMode: false,
      setDemoMode: (on) => set({ demoMode: on }),
      toggleDemoMode: () => set({ demoMode: !get().demoMode }),
    }),
    { name: "flowc0de-demo-mode" }
  )
);
