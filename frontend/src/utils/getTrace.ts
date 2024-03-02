import { readContract } from "@wagmi/core";
import { FuncParams } from "./types";
import { configs } from "./urlConfigs";

export const getTrace = async (req: FuncParams, chainId: number) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    method: chainId == 42161 ? "arbtrace_call" : "trace_call",
    params: [req, ["trace"], "latest"],
    id: 1,
    jsonrpc: "2.0",
  });

  const config = configs[chainId];

  const res = await fetch(config.rpcUrl, {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });

  const json = await res.json();
  console.log(json);

  const trace = json.result.trace;

  const transfers = [];

  for (let call of trace) {
    if (call?.action?.callType == "call") {
      if (call.action.input.startsWith("0xa9059cbb")) {
        // get the address, just the address
        const to = "0x" + call.action.input.slice(34, 74);
        console.log(to);
        const amount = parseInt(call.action.input.slice(74), 16);
        console.log(amount);

        const symbol = await readContract({
          address: call.action.to,
          abi: [
            {
              constant: true,
              inputs: [],
              name: "symbol",
              outputs: [{ name: "", type: "string" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "symbol",
          args: [] as any,
        });

        const decimals: any = await readContract({
          address: call.action.to,
          abi: [
            {
              constant: true,
              inputs: [],
              name: "decimals",
              outputs: [{ name: "", type: "uint256" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "decimals",
          args: [] as any,
        });

        console.log(decimals);
        console.log(symbol);

        transfers.push({
          to,
          amount: amount / 10 ** parseInt(decimals.toString()),
          from: call.action.from,
          contractAddress: call.action.to,
          symbol,
          rawAmount: amount,
          sign: to == req.from ? "+" : "-",
        });
      } else if (call.action.input.startsWith("0x23b872dd")) {
        const from = "0x" + call.action.input.slice(34, 74);
        console.log(from);
        const to = "0x" + call.action.input.slice(98, 138);
        console.log(to);
        const amount = parseInt(call.action.input.slice(138), 16);
        console.log(amount);

        const symbol = await readContract({
          address: call.action.to,
          abi: [
            {
              constant: true,
              inputs: [],
              name: "symbol",
              outputs: [{ name: "", type: "string" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "symbol",
          args: [] as any,
        });

        const decimals: any = await readContract({
          address: call.action.to,
          abi: [
            {
              constant: true,
              inputs: [],
              name: "decimals",
              outputs: [{ name: "", type: "uint256" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "decimals",
          args: [] as any,
        });

        console.log(decimals);

        transfers.push({
          to,
          amount: amount / 10 ** parseInt(decimals.toString()),
          from,
          contractAddress: call.action.to,
          symbol,
          rawAmount: amount,
          sign: to == req.from ? "+" : from == req.from ? "-" : "",
        });
      }
    }
  }

  var raw = JSON.stringify({
    method: "eth_estimateGas",
    params: [req],
    id: 1,
    jsonrpc: "2.0",
  });

  const gasUsed = await fetch(config.rpcUrl, {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });

  var raw = JSON.stringify({
    method: "eth_gasPrice",
    params: [],
    id: 1,
    jsonrpc: "2.0",
  });

  const gasPrice = await fetch(config.rpcUrl, {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  });

  const gasRes = await gasUsed.json();

  const gasPriceRes = await gasPrice.json();

  console.log(gasRes);

  const gas = !gasRes.error
    ? (parseInt(gasRes.result, 16) * parseInt(gasPriceRes.result, 16)) / 1e18
    : 0;

  console.log(
    (parseInt(gasRes.result, 16) * parseInt(gasPriceRes.result, 16)) / 1e18
  );

  return {
    gas,
    changes: transfers.filter(
      (transfer) =>
        transfer.from.toLocaleLowerCase() == req.from.toLocaleLowerCase() ||
        transfer.to.toLocaleLowerCase() == req.from.toLocaleLowerCase()
    ),
  };
};
