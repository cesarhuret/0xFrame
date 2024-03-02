import { createBrowserRouter, Outlet } from "react-router-dom";
import { Interact } from "./pages/Interact";
import { getSourceCode } from "./utils";
import { Generate } from "./pages/Generate";
import { Layout } from "./pages/Layout";
import { readContract } from "@wagmi/core";
import { Flex, Text } from "@chakra-ui/react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    ErrorBoundary: ({ error }: any) => (
      <Flex
        w={"full"}
        h={"100vh"}
        alignItems={"center"}
        justifyContent={"center"}
        direction={"column"}
        gap={"5"}
      >
        <Text>Oops, there was an error.</Text>
      </Flex>
    ),
    children: [
      {
        path: "/",
        element: <Generate />,
      },
      {
        path: "/:address/:function/",
        loader: async ({ params, request }) => {
          const url = new URL(request.url);
          const extra = url.searchParams.get("extra");
          const chainId = url.searchParams.get("chainId");
          const data = extra && JSON.parse(extra);
          let code =
            params &&
            (await getSourceCode(
              params.address || "",
              parseInt(chainId || "8453")
            ));

          if (
            JSON.parse(code[0].ABI).some(
              (func: any) => func.name == "implementation"
            )
          ) {
            const oxAddress: any = params.address || "";
            const implementation: any = await readContract({
              address: oxAddress,
              abi: JSON.parse(code[0].ABI),
              functionName: "implementation",
              args: [],
            });

            code = await getSourceCode(
              implementation,
              parseInt(chainId || "8453")
            );
          }

          return {
            contract: params.address,
            code: code[0],
            func: params.function,
            parameters: data,
          };
        },
        element: <Interact />,
      },
    ],
  },
]);

export default router;
