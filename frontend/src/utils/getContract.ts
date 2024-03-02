import { writeContract, readContract, waitForTransaction } from "@wagmi/core";
import { getSwapQuote } from "./getAssetPrice";
import { configs } from "./urlConfigs";

const zeroAddress = "0x0000000000000000000000000000000000000000";

export const write = async (quotes: any, chainId: number) => {
  const config = configs[chainId];
  console.log(quotes);

  let swapArgs: any = {
    isSwap: false,
  };
  let bridgeArgs: any = {
    isBridge: false,
  };

  for (let quote of quotes) {
    if (quote.type == "swap") {
      swapArgs = await getSwapQuote(
        quote.sellTokenAddress,
        quote.buyTokenAddress,
        quote.buyAmount,
        chainId
      );

      swapArgs.isSwap = true;
    } else if (quote.type == "bridge") {
      bridgeArgs = quote;
      console.log(bridgeArgs);

      bridgeArgs.isBridge = true;
    }
  }

  const params: any = [
    swapArgs.isSwap,
    swapArgs.sellTokenAddress || zeroAddress,
    (
      swapArgs.guaranteedPrice *
      10 ** 18 *
      (swapArgs.grossBuyAmount / 10 ** 6)
    ).toFixed(0) == "NaN"
      ? 0
      : (
          swapArgs.guaranteedPrice *
          10 ** 18 *
          (swapArgs.grossBuyAmount / 10 ** 6)
        ).toFixed(0),
    swapArgs.buyTokenAddress || config.USDC,
    swapArgs.allowanceTarget || zeroAddress,
    swapArgs.buyAmount || bridgeArgs.amount,
    swapArgs.to || zeroAddress,
    swapArgs.data || zeroAddress,
    bridgeArgs.isBridge,
    bridgeArgs.destinationChainSelector || 0,
    // "0x12aCeaD2db05eca2Af522b7789B5512F9B724ac7",
    // "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    // 1000000,
  ];

  // console.log()x``

  let bridgeFees: any = 0;

  console.log(bridgeArgs);

  if (bridgeArgs.isBridge) {
    bridgeFees = await readContract({
      address: config.executor,
      abi: abi,
      functionName: "estimateFee",
      args: [
        bridgeArgs.destinationChainSelector,
        bridgeArgs.receiver,
        config.USDC,
        bridgeArgs.amount,
      ],
    });
  }

  console.log(bridgeFees);
  console.log(swapArgs);
  console.log(params);

  const { hash } = await writeContract({
    address: config.executor,
    abi: abi,
    functionName: "exec",
    args: params,
    value: BigInt(swapArgs.value || 0) + BigInt(bridgeFees),
  });

  return await waitForTransaction({ hash });
};

const abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_exchangeProxy",
        type: "address",
        internalType: "address",
      },
      { name: "router", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    name: "MAX_UINT",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "acceptOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositETH",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "estimateFee",
    inputs: [
      {
        name: "_destinationChainSelector",
        type: "uint64",
        internalType: "uint64",
      },
      { name: "_receiver", type: "address", internalType: "address" },
      { name: "_token", type: "address", internalType: "address" },
      { name: "_amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "exchangeProxy",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "exec",
    inputs: [
      { name: "isSwap", type: "bool", internalType: "bool" },
      {
        name: "sellToken",
        type: "address",
        internalType: "contract IERC20",
      },
      { name: "sellAmount", type: "uint256", internalType: "uint256" },
      {
        name: "buyToken",
        type: "address",
        internalType: "contract IERC20",
      },
      { name: "spender", type: "address", internalType: "address" },
      { name: "buyAmount", type: "uint256", internalType: "uint256" },
      {
        name: "swapTarget",
        type: "address",
        internalType: "address payable",
      },
      { name: "swapCallData", type: "bytes", internalType: "bytes" },
      { name: "isBridge", type: "bool", internalType: "bool" },
      {
        name: "destinationChainSelector",
        type: "uint64",
        internalType: "uint64",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "fillQuote",
    inputs: [
      {
        name: "sellToken",
        type: "address",
        internalType: "contract IERC20",
      },
      { name: "sellAmount", type: "uint256", internalType: "uint256" },
      {
        name: "buyToken",
        type: "address",
        internalType: "contract IERC20",
      },
      { name: "spender", type: "address", internalType: "address" },
      {
        name: "swapTarget",
        type: "address",
        internalType: "address payable",
      },
      { name: "swapCallData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "number",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "to", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawETH",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "contract IERC20",
      },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "BoughtTokens",
    inputs: [
      {
        name: "sellToken",
        type: "address",
        indexed: false,
        internalType: "contract IERC20",
      },
      {
        name: "buyToken",
        type: "address",
        indexed: false,
        internalType: "contract IERC20",
      },
      {
        name: "boughtAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferRequested",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokensTransferred",
    inputs: [
      {
        name: "messageId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "destinationChainSelector",
        type: "uint64",
        indexed: true,
        internalType: "uint64",
      },
      {
        name: "receiver",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "feeToken",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "fees",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "DestinationChainNotAllowlisted",
    inputs: [
      {
        name: "destinationChainSelector",
        type: "uint64",
        internalType: "uint64",
      },
    ],
  },
  {
    type: "error",
    name: "FailedToWithdrawEth",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "target", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
  },
  { type: "error", name: "InvalidETHTransfer", inputs: [] },
  { type: "error", name: "InvalidReceiverAddress", inputs: [] },
  {
    type: "error",
    name: "NotEnoughBalance",
    inputs: [
      {
        name: "currentBalance",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "calculatedFees",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  { type: "error", name: "NothingToWithdraw", inputs: [] },
];
