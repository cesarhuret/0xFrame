import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  SimpleGrid,
  SlideFade,
  Spacer,
  Spinner,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ArrowForwardIcon,
  CheckIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { getAssetPrice, getSwapQuote } from "../utils/getAssetPrice";
import { chainIds, chainNames, chainSelectors } from "../utils/getChainId";
import { write } from "../utils/getContract";
import { useContractWrite, useSwitchNetwork } from "wagmi";
import { switchNetwork } from "@wagmi/core";
import { configs } from "../utils/urlConfigs";

export const BalanceModal = ({
  assets,
  simulation,
  isOpen,
  onClose,
  chain,
  account,
  transaction,
}: any) => {
  const [total, setTotal] = useState<number>(0);

  const [tabIndex, setTabIndex] = useState(0);

  const [swaps, setSwaps] = useState<any>([]);

  const [hash, setHash] = useState<any>();

  const handleSliderChange = async () => {
    tabIndex < 3 && setTabIndex(tabIndex + 1);

    console.log(tabIndex);

    tabIndex == 0 && (await getRoutes());
  };

  const getRoutes = async () => {
    let selectedInfo = assets.filter((asset: any) =>
      selectedTokens.includes(asset.contractAddress || asset.tokenName)
    );
    // for each of the assets in the simulation
    // use

    for (let buy of simulation) {
      // for each of the selected tokens
      for (let sell of selectedInfo) {
        // if the token is the same as the simulation token
        if (sell.balanceUsd > usdBalances[buy.contractAddress]) {
          const steps: any[] = [];

          sell.balanceUsd = sell.balanceUsd - usdBalances[buy.contractAddress];

          const temp: any = {
            ...buy,
          };

          if (chainIds[sell.blockchain] != chain) {
            const usd = (
              usdBalances[buy.contractAddress] *
              1.02 *
              10 ** 6
            ).toFixed(0);

            buy.contractAddress = configs[chainIds[sell.blockchain]].USDC;
            buy.symbol = "USDC";
            buy.decimals = 6;
            buy.rawAmount = usd;
          }

          console.log(sell);

          if (buy.contractAddress != sell.contractAddress) {
            const swap = await getSwapQuote(
              sell.contractAddress || sell.tokenSymbol,
              buy.contractAddress,
              buy.rawAmount,
              chainIds[sell.blockchain]
            );

            swap.sellTokenSymbol = sell.tokenSymbol;
            swap.buyTokenSymbol = buy.symbol;
            swap.sellDecimals = sell.tokenDecimals;
            if (buy.symbol == "USDC") {
              swap.buyDecimals = 6;
            }
            swap.type = "swap";

            steps.push(swap);
          }

          if (chainIds[sell.blockchain] != chain) {
            const bridge = {
              symbol: "USDC",
              fromChain: sell.blockchain,
              toChain: chainNames[chain],
              type: "bridge",
              amount: buy.rawAmount,
              receiver: account,
              destinationChainSelector: chainSelectors[chain],
            };

            steps.push(bridge);
          }

          if (temp.symbol != "USDC") {
            const lastSwap = await getSwapQuote(
              configs[chain].USDC,
              temp.contractAddress,
              temp.rawAmount,
              chain
            );

            lastSwap.sellTokenSymbol = "USDC";
            lastSwap.buyTokenSymbol = temp.symbol;
            lastSwap.sellDecimals = 6;
            lastSwap.buyDecimals = temp.decimals;
            lastSwap.type = "swap";

            steps.push(lastSwap);
          }

          // if the chains are different, we want to swap to usdc and bridge instead

          setSwaps((prevState: any) => [...prevState, ...steps]);
        }
      }
    }
  };

  useEffect(() => {
    tabIndex == 2 &&
      (async () => {
        const filtered = swaps.filter((swap: any) => swap.type == "bridge");
        console.log(filtered[0]);

        if (filtered.length > 0) {
          switchNetwork({
            chainId: chainIds[filtered[0].fromChain],
          }).then(() => {
            write(swaps, chainIds[filtered[0].fromChain.toLowerCase()]).then(
              () => {
                setTabIndex(3);
              }
            );
          });
        } else {
          write(swaps, chain).then(() => {
            setTabIndex(3);
          });
        }
      })();

    tabIndex == 3 &&
      (async () => {
        const filtered = swaps.filter((swap: any) => swap.type == "bridge");
        console.log(filtered[0]);

        if (filtered.length > 0) {
          switchNetwork({
            chainId: chainIds[filtered[0].toChain.toLowerCase()],
          }).then(() => {
            transaction();
          });
        } else {
          transaction();
        }
      })();
  }, [tabIndex]);

  const [usdBalances, setUsdBalances] = useState<any>({});

  const handleTabsChange = (index: any) => {
    setTabIndex(index);
  };

  const [selectedTokens, setSelectedTokens] = useState<any>([]);

  const [filled, setFilled] = useState<number>(0);

  const shadow = useColorModeValue("gray.200", "gray.800");

  const bg = useColorModeValue("#fffefe", "#151515");

  useEffect(() => {
    if (isOpen) {
      setTotal(0);

      (async () => {
        for (let asset of simulation) {
          console.log(asset);

          let balanceUSD = await getAssetPrice(
            asset.contractAddress,
            asset.rawAmount,
            chain
          );

          setUsdBalances((prevState: any) => ({
            ...prevState,
            [asset.contractAddress]: balanceUSD,
          }));

          setTotal((prevState: number) => prevState + balanceUSD);
        }
      })();
    }
  }, [assets, isOpen]);

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={isOpen}
      isCentered
      onClose={onClose}
      scrollBehavior="inside"
    >
      <ModalContent
        w={{ base: "95%", md: "400px" }}
        rounded={"2xl"}
        top={24}
        h={"400px"}
        boxShadow={"none"}
        overflowY={"scroll"}
        borderTop={"1px"}
        borderColor={shadow}
        bgColor={bg}
      >
        <ModalHeader py={3} pl={7} pr={3}>
          <Flex alignItems={"center"} flexDirection={"row"}>
            <Text>
              {tabIndex == 0
                ? "Select"
                : tabIndex == 1
                ? "Review"
                : tabIndex == 2
                ? "Swap"
                : tabIndex == 3
                ? "Transact"
                : ""}{" "}
            </Text>{" "}
            <Text fontSize={"sm"} fontWeight={"thin"} color={"gray.500"} ml={3}>
              {tabIndex + 1}/4
            </Text>
            <Spacer />
            <Text
              fontWeight={"thin"}
              fontSize={"sm"}
              color={filled > total ? "green.400" : "red.400"}
            >
              {filled.toFixed(2)}
            </Text>
            <Text fontWeight={"thin"} fontSize={"sm"} color={"gray.400"}>
              /{total.toFixed(2)}
            </Text>
            <Button
              variant={"ghost"}
              onClick={handleSliderChange}
              isDisabled={filled < total || tabIndex == 3}
              ml={2}
            >
              <ChevronRightIcon />
            </Button>
          </Flex>
        </ModalHeader>
        <ModalBody>
          <Tabs index={tabIndex} onChange={handleTabsChange}>
            <TabPanels>
              <TabPanel>
                {assets.map((asset: any, i: number) => (
                  <Button
                    variant={"ghost"}
                    key={i}
                    w={"full"}
                    justifyContent={"space-between"}
                    p={8}
                    my={1}
                    isDisabled={
                      filled > total &&
                      !selectedTokens.includes(
                        asset.contractAddress || asset.tokenName
                      )
                    }
                    border={"2px"}
                    borderColor={
                      selectedTokens.includes(
                        asset.contractAddress || asset.tokenName
                      )
                        ? "green.300"
                        : "transparent"
                    }
                    rounded={"xl"}
                    onClick={() => {
                      if (
                        !selectedTokens.includes(
                          asset.contractAddress || asset.tokenName
                        )
                      ) {
                        if (asset.tokenType == "NATIVE") {
                          setSelectedTokens((prevState: any) => [
                            ...prevState,
                            asset.tokenName,
                          ]);
                        } else {
                          setSelectedTokens((prevState: any) => [
                            ...prevState,
                            asset.contractAddress,
                          ]);
                        }
                        setFilled(
                          (prevState: number) =>
                            prevState + parseFloat(asset.balanceUsd)
                        );
                      } else {
                        asset.contractAddress
                          ? setSelectedTokens(
                              selectedTokens.filter(
                                (token: any) => token !== asset.contractAddress
                              )
                            )
                          : setSelectedTokens(
                              selectedTokens.filter(
                                (token: any) => token !== asset.tokenName
                              )
                            );

                        setFilled(
                          (prevState: number) =>
                            prevState - parseFloat(asset.balanceUsd)
                        );
                      }
                    }}
                  >
                    <HStack>
                      <Avatar src={asset.thumbnail} size={"xs"} />
                      <VStack
                        textAlign={"left"}
                        alignItems={"flex-start"}
                        gap={0}
                        spacing={0}
                      >
                        <Text>{asset.tokenSymbol}</Text>
                        <Text
                          fontWeight={"thin"}
                          fontSize="xs"
                          color={"gray.400"}
                        >
                          {asset.blockchain.toUpperCase()}
                        </Text>
                      </VStack>
                    </HStack>
                    <Spacer />
                    <VStack
                      gap={0}
                      spacing={0}
                      textAlign={"left"}
                      alignItems={"flex-end"}
                    >
                      <Text fontSize="sm">
                        {" "}
                        {parseFloat(asset.balance).toFixed(2)}
                      </Text>
                      <Text
                        fontWeight={"thin"}
                        fontSize="xs"
                        color={"gray.400"}
                      >
                        {parseFloat(asset.balanceUsd).toFixed(2)}$
                      </Text>
                    </VStack>
                  </Button>
                ))}
              </TabPanel>
              <TabPanel p={0}>
                <VStack spacing={2} alignItems={"flex-start"}>
                  {swaps.map((swap: any, i: number) =>
                    swap.type == "swap" ? (
                      <VStack
                        w={"full"}
                        key={i}
                        //   borderColor={"red.300"}
                        borderWidth={"1px"}
                        p={3}
                        borderRadius={"2xl"}
                        borderColor={shadow}
                        alignItems={"flex-start"}
                      >
                        <Text fontWeight={"bold"} fontSize={"xs"}>
                          {swap.type.toUpperCase()}
                        </Text>
                        <HStack w={"full"}>
                          <VStack alignItems={"flex-start"} spacing={0}>
                            <Text>
                              {(
                                parseFloat(swap.sellAmount) /
                                10 ** swap.sellDecimals
                              ).toFixed(4)}
                            </Text>
                            <Text fontSize={"xs"}>{swap.sellTokenSymbol}</Text>
                          </VStack>
                          <Spacer />
                          <ArrowForwardIcon boxSize={5} fontWeight={"thin"} />
                          <Spacer />
                          <VStack alignItems={"flex-start"} spacing={0}>
                            <Text>
                              {(
                                parseFloat(swap.buyAmount) /
                                10 ** swap.buyDecimals
                              ).toFixed(2)}
                            </Text>
                            <Text fontSize={"xs"}>{swap.buyTokenSymbol}</Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    ) : swap.type == "bridge" ? (
                      <VStack
                        w={"full"}
                        key={i}
                        //   borderColor={"red.300"}
                        borderWidth={"1px"}
                        p={3}
                        borderRadius={"2xl"}
                        borderColor={shadow}
                        alignItems={"flex-start"}
                      >
                        <Text fontWeight={"bold"} fontSize={"xs"}>
                          {swap.type.toUpperCase()}
                        </Text>
                        <HStack w={"full"}>
                          <VStack alignItems={"flex-start"} spacing={0}>
                            <Text fontSize={"sm"}>
                              {swap.fromChain.toUpperCase()}
                            </Text>
                            <Text fontSize={"xs"}>
                              {(parseFloat(swap.amount) / 10 ** 6).toFixed(2)}
                            </Text>
                            <Text fontSize={"xs"} color={"gray.400"}>
                              {swap.symbol}
                            </Text>
                          </VStack>
                          <Spacer />
                          <ArrowForwardIcon boxSize={5} fontWeight={"thin"} />
                          <Spacer />
                          <VStack alignItems={"flex-end"} spacing={0}>
                            <Text fontSize={"sm"}>
                              {swap.toChain.toUpperCase()}
                            </Text>
                            <Text fontSize={"xs"}>
                              {(parseFloat(swap.amount) / 10 ** 6).toFixed(2)}
                            </Text>
                            <Text fontSize={"xs"} color={"gray.400"}>
                              {swap.symbol}
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    ) : null
                  )}
                </VStack>
              </TabPanel>
              <TabPanel p={0}>
                <VStack
                  w={"full"}
                  minH={"300px"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  spacing={5}
                >
                  <Spinner borderWidth={"3px"} />
                  <Text>Confirm swaps in your wallet</Text>
                </VStack>
              </TabPanel>
              <TabPanel p={0}>
                <VStack
                  w={"full"}
                  minH={"300px"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  spacing={5}
                >
                  <Spinner borderWidth={"3px"} />
                  <Text>Confirm transaction</Text>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
