import { configs } from "./urlConfigs";

export const getSourceCode = async (address: string, chainId: number) => {
  const config = configs[chainId];

  const res = await fetch(
    config.etherscanApiUrl +
      "?module=contract&action=getsourcecode&address=" +
      address +
      "&apikey=" +
      config.etherscanAPIKey
  );

  const code = await res.json();

  return code.result;
};
