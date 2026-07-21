import type {
  ContractNodeData,
  EventNodeData,
  FlowEdge,
  FlowNode,
  FunctionNodeData,
  MappingNodeData,
  ModifierNodeData,
  StructNodeData,
  VariableNodeData,
} from "@/types/flow";

let counter = 0;
function id(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}
function row(name: string, type: string) {
  return { id: id("row"), name, type };
}
function eventRow(name: string, type: string, indexed = false) {
  return { id: id("row"), name, type, indexed };
}

export interface Template {
  key: string;
  title: string;
  description: string;
  build: () => { nodes: FlowNode[]; edges: FlowEdge[] };
}

/* ------------------------------------------------------------------ */
/* 1. Staking Token                                                    */
/* ------------------------------------------------------------------ */

function buildStakingToken() {
  const contractId = id("contract");
  const varId = id("variable");
  const mappingId = id("mapping");
  const eventId = id("event");
  const modifierId = id("modifier");
  const fnId = id("function");
  const ctorId = id("function");

  const nodes: FlowNode[] = [
    {
      id: contractId,
      type: "contract",
      position: { x: 40, y: 220 },
      data: {
        label: "Contract",
        name: "StakingToken",
        license: "MIT",
        pragma: "^0.8.24",
        inherits: "ERC20, Ownable",
        baseConstructorCalls: 'ERC20("StakingToken", "STK") Ownable(msg.sender)',
      } satisfies ContractNodeData,
    },
    {
      id: varId,
      type: "variable",
      position: { x: 420, y: 40 },
      data: {
        label: "Variable",
        name: "lockPeriod",
        varType: "uint256",
        visibility: "public",
        mutability: "constant",
        initialValue: "30 days",
      } satisfies VariableNodeData,
    },
    {
      id: mappingId,
      type: "mapping",
      position: { x: 420, y: 180 },
      data: {
        label: "Mapping",
        name: "unlockTime",
        keyType: "address",
        valueType: "uint256",
        visibility: "public",
      } satisfies MappingNodeData,
    },
    {
      id: eventId,
      type: "event",
      position: { x: 420, y: 320 },
      data: {
        label: "Event",
        name: "Staked",
        params: [eventRow("user", "address", true), eventRow("amount", "uint256")],
      } satisfies EventNodeData,
    },
    {
      id: modifierId,
      type: "modifier",
      position: { x: 420, y: 460 },
      data: {
        label: "Modifier",
        name: "unlocked",
        params: [],
        body: 'require(block.timestamp >= unlockTime[msg.sender], "Still locked");\n_;',
      } satisfies ModifierNodeData,
    },
    {
      id: fnId,
      type: "function",
      position: { x: 800, y: 200 },
      data: {
        label: "Function",
        name: "stake",
        isConstructor: false,
        visibility: "external",
        stateMutability: "nonpayable",
        params: [row("amount", "uint256")],
        returns: [],
        body: "_transfer(msg.sender, address(this), amount);\nunlockTime[msg.sender] = block.timestamp + lockPeriod;\nemit Staked(msg.sender, amount);",
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
    {
      id: ctorId,
      type: "function",
      position: { x: 800, y: 40 },
      data: {
        label: "Function",
        name: "constructor",
        isConstructor: true,
        visibility: "public",
        stateMutability: "nonpayable",
        params: [row("initialSupply", "uint256")],
        returns: [],
        body: "_mint(msg.sender, initialSupply);",
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
  ];

  const edges: FlowEdge[] = [
    { id: id("edge"), source: contractId, target: varId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: mappingId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: eventId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: modifierId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: fnId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: ctorId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: modifierId, target: fnId, style: { strokeWidth: 2, strokeDasharray: "4 3" } },
  ];

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/* 2. Mintable ERC20 Token                                             */
/* ------------------------------------------------------------------ */

function buildErc20Token() {
  const contractId = id("contract");
  const ctorId = id("function");
  const mintId = id("function");
  const burnId = id("function");

  const nodes: FlowNode[] = [
    {
      id: contractId,
      type: "contract",
      position: { x: 40, y: 160 },
      data: {
        label: "Contract",
        name: "MyToken",
        license: "MIT",
        pragma: "^0.8.24",
        inherits: "ERC20, Ownable",
        baseConstructorCalls: 'ERC20("MyToken", "MTK") Ownable(msg.sender)',
      } satisfies ContractNodeData,
    },
    {
      id: ctorId,
      type: "function",
      position: { x: 420, y: 20 },
      data: {
        label: "Function",
        name: "constructor",
        isConstructor: true,
        visibility: "public",
        stateMutability: "nonpayable",
        params: [row("initialSupply", "uint256")],
        returns: [],
        body: "_mint(msg.sender, initialSupply);",
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
    {
      id: mintId,
      type: "function",
      position: { x: 420, y: 180 },
      data: {
        label: "Function",
        name: "mint",
        isConstructor: false,
        visibility: "external",
        stateMutability: "nonpayable",
        params: [row("to", "address"), row("amount", "uint256")],
        returns: [],
        body: "_mint(to, amount);",
        extraModifiers: "onlyOwner",
      } satisfies FunctionNodeData,
    },
    {
      id: burnId,
      type: "function",
      position: { x: 420, y: 340 },
      data: {
        label: "Function",
        name: "burn",
        isConstructor: false,
        visibility: "external",
        stateMutability: "nonpayable",
        params: [row("amount", "uint256")],
        returns: [],
        body: "_burn(msg.sender, amount);",
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
  ];

  const edges: FlowEdge[] = [
    { id: id("edge"), source: contractId, target: ctorId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: mintId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: burnId, style: { strokeWidth: 2 } },
  ];

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/* 3. NFT Collection (ERC721)                                          */
/* ------------------------------------------------------------------ */

function buildNftCollection() {
  const contractId = id("contract");
  const varId = id("variable");
  const ctorId = id("function");
  const mintId = id("function");

  const nodes: FlowNode[] = [
    {
      id: contractId,
      type: "contract",
      position: { x: 40, y: 160 },
      data: {
        label: "Contract",
        name: "MyNFT",
        license: "MIT",
        pragma: "^0.8.24",
        inherits: "ERC721, Ownable",
        baseConstructorCalls: 'ERC721("MyNFT", "MNFT") Ownable(msg.sender)',
      } satisfies ContractNodeData,
    },
    {
      id: varId,
      type: "variable",
      position: { x: 420, y: 20 },
      data: {
        label: "Variable",
        name: "nextTokenId",
        varType: "uint256",
        visibility: "public",
        mutability: "mutable",
        initialValue: "0",
      } satisfies VariableNodeData,
    },
    {
      id: ctorId,
      type: "function",
      position: { x: 420, y: 160 },
      data: {
        label: "Function",
        name: "constructor",
        isConstructor: true,
        visibility: "public",
        stateMutability: "nonpayable",
        params: [],
        returns: [],
        body: "// nextTokenId starts at 0",
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
    {
      id: mintId,
      type: "function",
      position: { x: 420, y: 300 },
      data: {
        label: "Function",
        name: "mint",
        isConstructor: false,
        visibility: "external",
        stateMutability: "nonpayable",
        params: [row("to", "address")],
        returns: [],
        body: "_safeMint(to, nextTokenId);\nnextTokenId++;",
        extraModifiers: "onlyOwner",
      } satisfies FunctionNodeData,
    },
  ];

  const edges: FlowEdge[] = [
    { id: id("edge"), source: contractId, target: varId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: ctorId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: mintId, style: { strokeWidth: 2 } },
  ];

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/* 4. Simple Voting                                                    */
/* ------------------------------------------------------------------ */

function buildSimpleVoting() {
  const contractId = id("contract");
  const structId = id("struct");
  const proposalsVarId = id("variable");
  const hasVotedId = id("mapping");
  const eventId = id("event");
  const ctorId = id("function");
  const addProposalId = id("function");
  const voteId = id("function");

  const nodes: FlowNode[] = [
    {
      id: contractId,
      type: "contract",
      position: { x: 40, y: 220 },
      data: {
        label: "Contract",
        name: "SimpleVoting",
        license: "MIT",
        pragma: "^0.8.24",
        inherits: "Ownable",
        baseConstructorCalls: "Ownable(msg.sender)",
      } satisfies ContractNodeData,
    },
    {
      id: structId,
      type: "struct",
      position: { x: 420, y: 20 },
      data: {
        label: "Struct",
        name: "Proposal",
        fields: [
          { id: id("row"), name: "description", type: "string" },
          { id: id("row"), name: "voteCount", type: "uint256" },
        ],
      } satisfies StructNodeData,
    },
    {
      id: proposalsVarId,
      type: "variable",
      position: { x: 420, y: 160 },
      data: {
        label: "Variable",
        name: "proposals",
        varType: "Proposal[]",
        visibility: "public",
        mutability: "mutable",
        initialValue: "",
      } satisfies VariableNodeData,
    },
    {
      id: hasVotedId,
      type: "mapping",
      position: { x: 420, y: 280 },
      data: {
        label: "Mapping",
        name: "hasVoted",
        keyType: "address",
        valueType: "bool",
        visibility: "public",
      } satisfies MappingNodeData,
    },
    {
      id: eventId,
      type: "event",
      position: { x: 420, y: 400 },
      data: {
        label: "Event",
        name: "Voted",
        params: [eventRow("voter", "address", true), eventRow("proposalId", "uint256")],
      } satisfies EventNodeData,
    },
    {
      id: ctorId,
      type: "function",
      position: { x: 800, y: 20 },
      data: {
        label: "Function",
        name: "constructor",
        isConstructor: true,
        visibility: "public",
        stateMutability: "nonpayable",
        params: [],
        returns: [],
        body: "// nothing else to initialize",
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
    {
      id: addProposalId,
      type: "function",
      position: { x: 800, y: 160 },
      data: {
        label: "Function",
        name: "addProposal",
        isConstructor: false,
        visibility: "external",
        stateMutability: "nonpayable",
        params: [row("description", "string")],
        returns: [],
        body: "proposals.push(Proposal({ description: description, voteCount: 0 }));",
        extraModifiers: "onlyOwner",
      } satisfies FunctionNodeData,
    },
    {
      id: voteId,
      type: "function",
      position: { x: 800, y: 320 },
      data: {
        label: "Function",
        name: "vote",
        isConstructor: false,
        visibility: "external",
        stateMutability: "nonpayable",
        params: [row("proposalId", "uint256")],
        returns: [],
        body: 'require(!hasVoted[msg.sender], "Already voted");\nhasVoted[msg.sender] = true;\nproposals[proposalId].voteCount++;\nemit Voted(msg.sender, proposalId);',
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
  ];

  const edges: FlowEdge[] = [
    { id: id("edge"), source: contractId, target: structId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: proposalsVarId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: hasVotedId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: eventId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: ctorId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: addProposalId, style: { strokeWidth: 2 } },
    { id: id("edge"), source: contractId, target: voteId, style: { strokeWidth: 2 } },
  ];

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/* 5. Escrow                                                           */
/* ------------------------------------------------------------------ */

function buildEscrow() {
  const contractId = id("contract");
  const buyerId = id("variable");
  const sellerId = id("variable");
  const arbiterId = id("variable");
  const amountId = id("variable");
  const releasedId = id("variable");
  const eventId = id("event");
  const ctorId = id("function");
  const releaseId = id("function");
  const refundId = id("function");

  const nodes: FlowNode[] = [
    {
      id: contractId,
      type: "contract",
      position: { x: 40, y: 260 },
      data: {
        label: "Contract",
        name: "SimpleEscrow",
        license: "MIT",
        pragma: "^0.8.24",
        inherits: "",
        baseConstructorCalls: "",
      } satisfies ContractNodeData,
    },
    {
      id: buyerId,
      type: "variable",
      position: { x: 420, y: 0 },
      data: { label: "Variable", name: "buyer", varType: "address", visibility: "public", mutability: "mutable", initialValue: "" } satisfies VariableNodeData,
    },
    {
      id: sellerId,
      type: "variable",
      position: { x: 420, y: 100 },
      data: { label: "Variable", name: "seller", varType: "address", visibility: "public", mutability: "mutable", initialValue: "" } satisfies VariableNodeData,
    },
    {
      id: arbiterId,
      type: "variable",
      position: { x: 420, y: 200 },
      data: { label: "Variable", name: "arbiter", varType: "address", visibility: "public", mutability: "mutable", initialValue: "" } satisfies VariableNodeData,
    },
    {
      id: amountId,
      type: "variable",
      position: { x: 420, y: 300 },
      data: { label: "Variable", name: "amount", varType: "uint256", visibility: "public", mutability: "mutable", initialValue: "" } satisfies VariableNodeData,
    },
    {
      id: releasedId,
      type: "variable",
      position: { x: 420, y: 400 },
      data: { label: "Variable", name: "released", varType: "bool", visibility: "public", mutability: "mutable", initialValue: "false" } satisfies VariableNodeData,
    },
    {
      id: eventId,
      type: "event",
      position: { x: 420, y: 500 },
      data: {
        label: "Event",
        name: "Released",
        params: [eventRow("to", "address", true), eventRow("amount", "uint256")],
      } satisfies EventNodeData,
    },
    {
      id: ctorId,
      type: "function",
      position: { x: 800, y: 120 },
      data: {
        label: "Function",
        name: "constructor",
        isConstructor: true,
        visibility: "public",
        stateMutability: "payable",
        params: [row("seller_", "address"), row("arbiter_", "address")],
        returns: [],
        body: "buyer = msg.sender;\nseller = seller_;\narbiter = arbiter_;\namount = msg.value;",
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
    {
      id: releaseId,
      type: "function",
      position: { x: 800, y: 300 },
      data: {
        label: "Function",
        name: "release",
        isConstructor: false,
        visibility: "external",
        stateMutability: "nonpayable",
        params: [],
        returns: [],
        body: 'require(msg.sender == arbiter, "Only arbiter");\nrequire(!released, "Already released");\nreleased = true;\npayable(seller).transfer(amount);\nemit Released(seller, amount);',
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
    {
      id: refundId,
      type: "function",
      position: { x: 800, y: 460 },
      data: {
        label: "Function",
        name: "refundBuyer",
        isConstructor: false,
        visibility: "external",
        stateMutability: "nonpayable",
        params: [],
        returns: [],
        body: 'require(msg.sender == arbiter, "Only arbiter");\nrequire(!released, "Already released");\nreleased = true;\npayable(buyer).transfer(amount);\nemit Released(buyer, amount);',
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
  ];

  const edges: FlowEdge[] = [
    buyerId, sellerId, arbiterId, amountId, releasedId, eventId, ctorId, releaseId, refundId,
  ].map((target) => ({
    id: id("edge"),
    source: contractId,
    target,
    style: { strokeWidth: 2 },
  }));

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/* 6. ETH Vesting Wallet                                               */
/* ------------------------------------------------------------------ */

function buildVestingWallet() {
  const contractId = id("contract");
  const beneficiaryId = id("variable");
  const startId = id("variable");
  const durationId = id("variable");
  const releasedId = id("variable");
  const eventId = id("event");
  const ctorId = id("function");
  const vestedAmountId = id("function");
  const releasableId = id("function");
  const releaseId = id("function");

  const nodes: FlowNode[] = [
    {
      id: contractId,
      type: "contract",
      position: { x: 40, y: 260 },
      data: {
        label: "Contract",
        name: "EthVestingWallet",
        license: "MIT",
        pragma: "^0.8.24",
        inherits: "",
        baseConstructorCalls: "",
      } satisfies ContractNodeData,
    },
    {
      id: beneficiaryId,
      type: "variable",
      position: { x: 420, y: 0 },
      data: { label: "Variable", name: "beneficiary", varType: "address", visibility: "public", mutability: "immutable", initialValue: "" } satisfies VariableNodeData,
    },
    {
      id: startId,
      type: "variable",
      position: { x: 420, y: 100 },
      data: { label: "Variable", name: "start", varType: "uint256", visibility: "public", mutability: "immutable", initialValue: "" } satisfies VariableNodeData,
    },
    {
      id: durationId,
      type: "variable",
      position: { x: 420, y: 200 },
      data: { label: "Variable", name: "duration", varType: "uint256", visibility: "public", mutability: "immutable", initialValue: "" } satisfies VariableNodeData,
    },
    {
      id: releasedId,
      type: "variable",
      position: { x: 420, y: 300 },
      data: { label: "Variable", name: "released", varType: "uint256", visibility: "public", mutability: "mutable", initialValue: "0" } satisfies VariableNodeData,
    },
    {
      id: eventId,
      type: "event",
      position: { x: 420, y: 400 },
      data: {
        label: "Event",
        name: "EthReleased",
        params: [eventRow("amount", "uint256")],
      } satisfies EventNodeData,
    },
    {
      id: ctorId,
      type: "function",
      position: { x: 800, y: 20 },
      data: {
        label: "Function",
        name: "constructor",
        isConstructor: true,
        visibility: "public",
        stateMutability: "payable",
        params: [row("beneficiary_", "address"), row("durationSeconds", "uint256")],
        returns: [],
        body: "beneficiary = beneficiary_;\nstart = block.timestamp;\nduration = durationSeconds;",
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
    {
      id: vestedAmountId,
      type: "function",
      position: { x: 800, y: 180 },
      data: {
        label: "Function",
        name: "vestedAmount",
        isConstructor: false,
        visibility: "public",
        stateMutability: "view",
        params: [],
        returns: [row("", "uint256")],
        body: "if (block.timestamp < start) return 0;\nif (block.timestamp >= start + duration) return address(this).balance + released;\nreturn ((address(this).balance + released) * (block.timestamp - start)) / duration;",
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
    {
      id: releasableId,
      type: "function",
      position: { x: 800, y: 340 },
      data: {
        label: "Function",
        name: "releasable",
        isConstructor: false,
        visibility: "public",
        stateMutability: "view",
        params: [],
        returns: [row("", "uint256")],
        body: "return vestedAmount() - released;",
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
    {
      id: releaseId,
      type: "function",
      position: { x: 800, y: 480 },
      data: {
        label: "Function",
        name: "release",
        isConstructor: false,
        visibility: "external",
        stateMutability: "nonpayable",
        params: [],
        returns: [],
        body: "uint256 amount = releasable();\nreleased += amount;\npayable(beneficiary).transfer(amount);\nemit EthReleased(amount);",
        extraModifiers: "",
      } satisfies FunctionNodeData,
    },
  ];

  const edges: FlowEdge[] = [
    beneficiaryId, startId, durationId, releasedId, eventId, ctorId, vestedAmountId, releasableId, releaseId,
  ].map((target) => ({
    id: id("edge"),
    source: contractId,
    target,
    style: { strokeWidth: 2 },
  }));

  return { nodes, edges };
}

export const TEMPLATES: Template[] = [
  {
    key: "staking-token",
    title: "Staking Token",
    description: "ERC20 token where holders lock tokens for 30 days to stake",
    build: buildStakingToken,
  },
  {
    key: "erc20-token",
    title: "ERC20 Token",
    description: "Simple mintable & burnable token, owner-controlled minting",
    build: buildErc20Token,
  },
  {
    key: "nft-collection",
    title: "NFT Collection",
    description: "ERC721 collection with sequential owner-only minting",
    build: buildNftCollection,
  },
  {
    key: "simple-voting",
    title: "Simple Voting",
    description: "Owner-created proposals, one vote per address",
    build: buildSimpleVoting,
  },
  {
    key: "escrow",
    title: "Escrow",
    description: "Buyer/seller/arbiter escrow releasing or refunding ETH",
    build: buildEscrow,
  },
  {
    key: "vesting-wallet",
    title: "ETH Vesting Wallet",
    description: "Linear ETH vesting to a beneficiary over a fixed duration",
    build: buildVestingWallet,
  },
];
