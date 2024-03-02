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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Image,
  Spinner,
  useToast,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Spacer,
  Slide,
  ScaleFade,
  AvatarBadge,
} from "@chakra-ui/react";
import { Link, json, useLoaderData } from "react-router-dom";
import { utils } from "ethers";
import { FcGoogle } from "react-icons/fc";
import { getAssetChanges } from "../utils";
import { CaretDownIcon, GearIcon, CircleIcon } from "../icon";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  useAccount,
  useContractWrite,
  useBalance,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { motion } from "framer-motion";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { BalanceModal } from "../components/BalanceModal";
import { getBalance } from "../utils/getWalletBalance";
import { getTrace } from "../utils/getTrace";
import { UserInfo } from "../components/UserInfo";
import { configs } from "../utils/urlConfigs";

export const Interact = () => {
  const { contract, func, code, parameters }: any = useLoaderData();

  const { address, isConnecting, isDisconnected, isConnected } = useAccount();

  const {
    data: userBalance,
    isLoading: balanceLoading,
    isError,
  } = useBalance({ address: address });

  const { open } = useWeb3Modal();

  const [gasFee, setGasFee] = React.useState<any>(0);

  const [res, setResponse] = React.useState<string>("");

  const [balanceChanges, setBalanceChanges] = React.useState<any>([]);

  const [params, setParams] = React.useState<any>([]);

  const [value, setValue] = React.useState<any>(parameters?.value);

  const [loading, setLoading] = React.useState<boolean>(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { chain } = useNetwork();

  const [assets, setAssets] = React.useState<any>([]);

  const [selectedTokens, setSelectedTokens] = React.useState<any>([]);

  const config = configs[chain?.id || 8453];

  const {
    chains,
    error: switchNetError,
    isLoading: switchNetLoading,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();

  const toast = useToast();

  const bg = useColorModeValue("#fffefe", "#151515");

  const parsedABI = JSON.parse(code.ABI);
  const filtered = parsedABI.filter((f: any) => f.name == func)[0].inputs;

  React.useEffect(() => {
    const entries = parameters;
    for (let entry of entries) {
      let index = filtered.map((input: any) => input.name).indexOf(entry[0]);
      if (typeof entry[1] == "number") {
        index != -1
          ? setParams((prevState: any) => [
              ...prevState.slice(0, index),
              BigInt(entry[1]),
              ...prevState.slice(index + 1),
            ])
          : setParams((prevState: any) => [
              ...prevState.slice(0, index),
              " ",
              ...prevState.slice(index + 1),
            ]);
      } else {
        index != -1
          ? setParams((prevState: any) => [
              ...prevState.slice(0, index),
              entry[1],
              ...prevState.slice(index + 1),
            ])
          : setParams((prevState: any) => [
              ...prevState.slice(0, index),
              " ",
              ...prevState.slice(index + 1),
            ]);
      }
    }
  }, []);

  const completeTransaction = async () => {
    let negative = false;

    for (let change of balanceChanges) {
      if (change.from == `${address}`.toLowerCase()) {
        negative = true;
      }
    }

    if (negative) {
      onOpen();
    } else {
      write();

      console.log(data);
    }
  };

  React.useEffect(() => {
    const assetBalanceChange = async () => {
      const inf = new utils.Interface(code.ABI);
      const data = inf.encodeFunctionData(func, params);

      const { changes, gas } = await getTrace(
        {
          from: `${address}`,
          to: contract,
          value: "0x0",
          data,
        },
        chain?.id || 8453
      );

      setBalanceChanges(changes);
      setGasFee(gas.toFixed(6));
    };

    params.length == parameters.length &&
      address &&
      balanceChanges.length == 0 &&
      assetBalanceChange();
  }, [params]);

  React.useEffect(() => {
    isConnected && getBalance(address || "", setAssets);
  }, [isConnected]);

  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: contract,
    abi: JSON.parse(code.ABI),
    functionName: func,
    args: params,
    value: value,
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      setLoading(false);
    },
  });

  React.useEffect(() => {
    setResponse(data?.hash || "");
    isOpen && onClose();
  }, [data]);

  return (
    <Flex
      w={"full"}
      h={"100vh"}
      alignItems={"center"}
      justifyContent={"center"}
      direction={"column"}
      gap={"5"}
    >
      <Stack w={{ base: "95%", md: "400px" }}>
        <BalanceModal
          assets={assets}
          isOpen={isOpen}
          onClose={onClose}
          simulation={balanceChanges}
          chain={chain?.id}
          account={address}
          transaction={async () => {
            write();
          }}
        />
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
          gap={7}
          p={10}
          rounded={"2xl"}
          boxShadow={"xl"}
          bgColor={bg}
        >
          <Heading size={"lg"} fontWeight={"medium"}>
            <b>{code.ContractName}</b>
          </Heading>
          <VStack w={"90%"} alignItems={"flex-start"} justifyContent={"start"}>
            <Heading size={"xs"} fontWeight={"bold"}>
              SUMMARY
            </Heading>
            <Divider />
            <Text w={"full"}>
              Calling <b>{func}</b>
            </Text>
          </VStack>
          {address && (
            <VStack
              w={"100%"}
              alignItems={"flex-start"}
              justifyContent={"start"}
              borderRadius={"xl"}
              borderWidth={1}
              p={4}
            >
              {balanceChanges?.map((change: any, i: number) => (
                <HStack w={"full"} key={i} justifyContent={"space-between"}>
                  <Image src={change.logo} maxWidth={"20px"} rounded={"md"} />
                  <Text fontSize={"sm"}>
                    {change.sign} {parseFloat(change.amount).toFixed(2)}{" "}
                    {change.symbol}
                  </Text>
                </HStack>
              ))}
            </VStack>
          )}
          {params.length > 0 && (
            <VStack
              w={"100%"}
              alignItems={"flex-start"}
              justifyContent={"start"}
            >
              <Accordion allowMultiple w={"full"}>
                <AccordionItem
                  w={"full"}
                  borderWidth={0}
                  style={{ borderBottomWidth: "0" }}
                >
                  <Heading size={"xs"} fontWeight={"semi-bold"}>
                    <AccordionButton borderWidth={1} rounded={"xl"}>
                      <Box as="span" flex="1" textAlign="left">
                        Advanced
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </Heading>
                  <AccordionPanel p={2}>
                    <VStack
                      alignItems={"flex-start"}
                      justifyContent={"start"}
                      overflowY={"scroll"}
                      maxH={"250px"}
                      w={"full"}
                    >
                      {filtered?.map((param: any, i: number) => (
                        <Input
                          key={i}
                          variant={"flushed"}
                          value={params[i]?.toString() || ""}
                          placeholder={param.name}
                          minH={"40px"}
                          type={param.type.includes("int") ? "number" : "text"}
                          onChange={(e) => {
                            param.type.includes("int")
                              ? setParams((prevState: any) => [
                                  ...prevState.slice(0, i),
                                  BigInt(e.target.value),
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
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </VStack>
          )}
          {address ? (
            <>
              <Flex
                flexDirection={"row"}
                w={"90%"}
                justifyContent={"space-between"}
              >
                <Text>Fees</Text>
                <Text fontWeight={"bold"}>{gasFee} ETH</Text>{" "}
                {/* TODO: Convert ETH Gas Fee to USD */}
              </Flex>
              {loading ? (
                <Spinner />
              ) : res ? (
                <Link to={`${config.etherscanUrl}tx/${res}`}>
                  <Button w={"200px"} variant={"outline"} alignSelf={"center"}>
                    View Receipt ↗
                  </Button>
                </Link>
              ) : (
                <Button
                  w={"200px"}
                  borderRadius={"xl"}
                  variant={"outline"}
                  alignSelf={"center"}
                  onClick={() => completeTransaction()}
                >
                  Next
                </Button>
              )}
            </>
          ) : (
            <Button
              variant={"outline"}
              w={"200px"}
              alignSelf={"center"}
              onClick={() => open()}
            >
              <Text>Connect Wallet</Text>
            </Button>
          )}
        </Flex>
      </Stack>
    </Flex>
  );
};
