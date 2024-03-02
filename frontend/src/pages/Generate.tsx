import * as React from "react";
import {
  Text,
  VStack,
  Heading,
  Flex,
  Stack,
  Button,
  HStack,
  Input,
  Divider,
  Box,
  Select,
  IconButton,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { utils } from "ethers";
import { getSourceCode } from "../utils";
import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import { readContract } from "@wagmi/core";
import {
  useAccount,
  useBalance,
  useChainId,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { UserInfo } from "../components/UserInfo";
import { useWeb3Modal } from "@web3modal/wagmi/react";

declare global {
  interface Window {
    pako: any;
  }
}

export const Generate = () => {
  const [contract, setAddress] = React.useState<string>("");

  const [functions, setFunctions] = React.useState<any>();

  const [func, setFunc] = React.useState<string>("");

  const [inputs, setInputs] = React.useState<any[]>([]);

  const [res, setRes] = React.useState<string>("");

  const [params, setParams] = React.useState<any[]>([]);

  const [value, setValue] = React.useState<any>("0");

  const toast = useToast();

  const bg = useColorModeValue("#fffefe", "#151515");

  const { chain } = useNetwork();

  const { address, isConnected } = useAccount();

  const {
    data: userBalance,
    isLoading: balanceLoading,
    isError,
  } = useBalance({ address: address });

  const getABI = async () => {
    const code = await getSourceCode(contract, chain?.id || 8453);

    let json = JSON.parse(code[0].ABI);

    console.log(json);

    if (json.some((func: any) => func.name == "implementation")) {
      const oxAddress: any = contract;
      const implementation: any = await readContract({
        address: oxAddress,
        chainId: chain?.id,
        abi: json,
        functionName: "implementation",
        args: [],
      });

      const code = await getSourceCode(implementation, chain?.id || 8453);

      json = JSON.parse(code[0].ABI);
    }

    setFunctions(
      json.filter(
        (func: any) =>
          func.type == "function" &&
          !["pure", "view"].includes(func.stateMutability)
      )
    );
  };

  const generate = async () => {
    let parameters = [];
    for (let input of inputs) {
      if (params[inputs.indexOf(input)] !== "") {
        parameters.push([input.name, params[inputs.indexOf(input)]]);
      }
    }

    const jsonData = JSON.stringify(parameters);

    navigator.clipboard.writeText(
      window.location.origin +
        "/" +
        contract +
        "/" +
        func +
        "?extra=" +
        jsonData +
        "&chainId=" +
        chain?.id
    );

    toast({
      title: "Link copied to clipboard!",
      position: "top-right",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const { open } = useWeb3Modal();

  const {
    chains,
    error: switchNetError,
    isLoading: switchNetLoading,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();

  return (
    <Flex
      w={"full"}
      h={"100vh"}
      alignItems={"center"}
      justifyContent={"center"}
      direction={"column"}
      // gap={"5"}
      overflowY={"scroll"}
    >
      <Stack w={{ base: "95%", md: "400px" }}>
        <UserInfo
          isConnected={isConnected}
          userBalance={userBalance}
          balanceLoading={balanceLoading}
          address={address}
          switchNetwork={switchNetwork}
          chains={chains}
          chain={chain}
          open={open}
          isLoading={switchNetLoading}
          pendingChainId={pendingChainId}
          bg={bg}
        />
      </Stack>
      <Stack w={{ base: "95%", md: "400px" }}>
        <Flex
          alignItems={"center"}
          justifyContent={"space-between"}
          flexDirection={"column"}
          minH={"lg"}
          gap={10}
          my={10}
          p={10}
          rounded={"2xl"}
          boxShadow={"2xl"}
          bgColor={bg}
        >
          <Heading size={"lg"} fontWeight={"medium"}>
            Generate a new URL
          </Heading>

          <VStack w={"90%"} alignItems={"flex-start"} justifyContent={"start"}>
            <Heading size={"xs"} fontWeight={"semi-bold"}>
              Contract
            </Heading>

            <HStack w={"full"}>
              <Input
                variant={"flushed"}
                value={contract}
                placeholder={"Contract Address"}
                onChange={(e) => {
                  setAddress(e.target.value);
                }}
              />
              <IconButton
                variant={"ghost"}
                colorScheme={"green"}
                aria-label="check"
                icon={<CheckIcon />}
                onClick={getABI}
              />
            </HStack>
            {/* <Text w={'full'}>Interacting with <b>{code.ContractName}</b></Text>
            <Text w={'full'}>Calling <b>{func}</b></Text> */}
          </VStack>
          <Select
            disabled={!functions}
            w={"90%"}
            placeholder="Select Function"
            onChange={(e) => {
              const temp = functions.filter(
                (func: any) => func.name == e.target.value
              )[0].inputs;
              setInputs(temp);
              setFunc(e.target.value);
              setParams(new Array(temp.length).fill(""));
            }}
          >
            {functions?.map((func: any, i: number) => (
              <option key={i} value={func.name}>
                {func.name}
              </option>
            ))}
          </Select>
          {inputs.length > 0 && (
            <VStack
              w={"90%"}
              alignItems={"flex-start"}
              justifyContent={"start"}
            >
              <Heading size={"xs"} fontWeight={"semi-bold"}>
                Params
              </Heading>
              <Divider />
              <VStack
                alignItems={"flex-start"}
                justifyContent={"start"}
                overflowY={"scroll"}
                maxH={"250px"}
                w={"full"}
              >
                {inputs?.map((param: any, i: number) => (
                  <Input
                    key={i}
                    variant={"flushed"}
                    value={
                      param.type.includes("int") ? params[i] : params[i] || ""
                    }
                    placeholder={
                      ("" + param.name + "").slice(0, 1).toLocaleUpperCase() +
                      ("" + param.name + "").slice(1)
                    }
                    // disabled={response != null}
                    minH={"40px"}
                    type={param.type.includes("int") ? "number" : "text"}
                    onChange={(e) => {
                      param.type.includes("int")
                        ? setParams((prevState: any) => [
                            ...prevState.slice(0, i),
                            parseInt(e.target.value || "0"),
                            ...prevState.slice(i + 1),
                          ])
                        : setParams((prevState: any) => [
                            ...prevState.slice(0, i),
                            e.target.value,
                            ...prevState.slice(i + 1),
                          ]);
                    }}
                  />
                ))}
              </VStack>
            </VStack>
          )}
          <VStack w={"90%"} alignItems={"flex-start"} justifyContent={"start"}>
            <Heading size={"xs"} fontWeight={"bold"}>
              Value
            </Heading>
            <Divider />
            <HStack w={"full"}>
              <Input
                variant={"flushed"}
                value={utils.formatEther(value || "0") || "0"}
                placeholder={"Value"}
                // disabled={response != null}
                minH={"40px"}
                type={"number"}
                onChange={(e) =>
                  setValue(utils.parseEther(e.target.value || "0"))
                }
              />
              <Text>ETH</Text>
            </HStack>
          </VStack>
          <Button
            w={"full"}
            h={"50px"}
            colorScheme={"purple"}
            onClick={generate}
            isDisabled={!(func && value)}
            alignSelf={"center"}
            rightIcon={<CopyIcon />}
          >
            Generate Link
          </Button>
        </Flex>
      </Stack>
    </Flex>
  );
};
