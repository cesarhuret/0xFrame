import { configs } from "./urlConfigs";

export const getAssetPrice = async (
  token: string,
  amount: number,
  chainId: number
) => {
  const config = configs[chainId];

  if (token.toLocaleLowerCase() == config.USDC) {
    return amount / 10 ** 6;
  } else {
    const price = await fetch(
      config.priceUrl +
        "swap/v1/price" +
        "?sellToken=" +
        token +
        "&buyToken=" +
        config.USDC +
        "&sellAmount=" +
        amount,
      {
        method: "GET",
        headers: {
          "0x-api-key": config.apiKey,
        },
      }
    );

    let json = await price.json();

    return parseFloat(json.buyAmount) / 10 ** 6;
  }
};

export const getSwapQuote = async (
  sell: string,
  buy: string,
  amountToBuy: any,
  chainId: number
) => {
  const config = configs[chainId];
  const price = await fetch(
    config.priceUrl +
      "swap/v1/quote" +
      "?sellToken=" +
      sell +
      "&buyToken=" +
      buy +
      "&buyAmount=" +
      amountToBuy.toString(),
    {
      method: "GET",
      headers: {
        "0x-api-key": config.apiKey,
      },
    }
  );

  let json = await price.json();

  return json;
};
