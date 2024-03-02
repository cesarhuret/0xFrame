import { ColorModeScript } from "@chakra-ui/react";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorker from "./serviceWorker";
import router from "./Router";
import { RouterProvider } from "react-router-dom";
import { ChakraProvider, Flex, Spinner } from "@chakra-ui/react";
import theme from "./theme";

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { WagmiConfig } from "wagmi";
import { arbitrum, base } from "viem/chains";

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = "6eedd1bc76b0a1e964024fdd3b8c0885";

// 2. Create wagmiConfig
const metadata = {
  name: "0xFrame",
  description: "Removing Barriers to Defi interfaces",
  url: "0xFrame",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [base, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = ReactDOM.createRoot(container);

const FullSpinner = () => (
  <Flex w={"100vw"} h={"100vh"} justifyContent={"center"} alignItems={"center"}>
    <Spinner />
  </Flex>
);

createWeb3Modal({ wagmiConfig, projectId, chains });

root.render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <ChakraProvider theme={theme}>
        <RouterProvider router={router} fallbackElement={<FullSpinner />} />
      </ChakraProvider>
    </WagmiConfig>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
