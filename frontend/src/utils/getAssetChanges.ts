import { FuncParams } from "./types";

export const getAssetChanges = async (rpcUrl: string, params: [FuncParams]) => {
  const changes = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "alchemy_simulateAssetChanges",
      params,
    }),
  });

  const res = await changes.json();

  console.log("simulation: ", res);

  return res.result;
};
