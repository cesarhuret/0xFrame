import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CircleIcon } from "../icon";
import { ChevronDownIcon } from "@chakra-ui/icons";

export const UserInfo = ({
  isConnected,
  userBalance,
  balanceLoading,
  address,
  switchNetwork,
  chains,
  chain,
  open,
  isLoading,
  pendingChainId,
  bg,
}: any) => {
  return (
    <>
      {isConnected && (
        <Flex
          alignItems={"center"}
          justifyContent={"space-between"}
          flexDirection={"row"}
          p={2}
          px={4}
          rounded={"2xl"}
          boxShadow={"base"}
          bgColor={bg}
        >
          <p style={{ fontWeight: "bold" }}>
            {balanceLoading
              ? "0.00"
              : `${parseFloat(userBalance?.formatted ?? "").toFixed(2)} ETH`}
          </p>
          <Button
            variant={"ghost"}
            onClick={() => {
              open({ view: "Account" });
            }}
            borderRadius={"xl"}
          >
            <Text mr={3}>{address?.substring(0, 7) + ""}</Text>
            <CircleIcon
              size={10}
              style={{
                color: "green",
              }}
            />
          </Button>

          <Menu>
            <MenuButton
              as={Button}
              bg="transparent"
              rightIcon={<ChevronDownIcon />}
              p={0}
              _hover={{ bg: "transparent" }}
              _focus={{ bg: "transparent" }}
              _active={{ bg: "transparent" }}
            >
              {chain?.name ?? "Select Network"}
            </MenuButton>

            <MenuList py={1} px={2} rounded={"2xl"} bg="transparent">
              {chains.map((x: any) => (
                <MenuItem
                  bg="transparent"
                  disabled={!switchNetwork || x.id === chain?.id}
                  key={x.id}
                  onClick={() => switchNetwork?.(x.id)}
                  rounded={"2xl"}
                  w={"full"}
                >
                  <Flex justifyContent={"space-between"} w={"full"}>
                    {x.name}
                    <Box>
                      {isLoading && pendingChainId === x.id && " (switching)"}
                      <CircleIcon
                        size={10}
                        style={{
                          color: x.id === chain?.id ? "green" : "transparent",
                        }}
                      />
                    </Box>
                  </Flex>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>
      )}
    </>
  );
};
