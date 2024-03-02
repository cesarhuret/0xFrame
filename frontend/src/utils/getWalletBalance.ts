export const getBalance = async (address: string, setAssets: any) => {
  const url =
    "https://rpc.ankr.com/multichain/b4f56c3dadaf8fec029d80e264049252cdcc001ce945814a9d6118f939a2a6c9";

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "ankr_getAccountBalance",
      params: {
        blockchain: ["arbitrum", "base"],
        // walletAddress: `${address}`.toLowerCase(),
        walletAddress: address,
      },
    }),
  };

  const balances = await fetch(url, requestOptions);

  const json = await balances.json();

  console.log(json);

  for (let asset of json.result.assets) {
    if (!asset.contractAddress && asset.tokenType == "NATIVE") {
      asset.tokenName = asset.tokenName + "_" + asset.blockchain;
    }
  }

  setAssets(json.result.assets);
};
