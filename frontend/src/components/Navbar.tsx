import { Flex, HStack, Button, useColorMode, Heading } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "../icon";
import { motion } from "framer-motion";

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <HStack
      pos={"fixed"}
      justifyContent={"space-between"}
      w={"100%"}
      px={4}
      mt={2}
    >
      <Heading size={"md"}>0xFrame</Heading>

      <Flex>
        <Button
          onClick={toggleColorMode}
          variant={"ghost"}
          _hover={{ bg: "none" }}
        >
          <motion.div
            whileTap={{
              scale: 0.95,
              borderRadius: "100%",
              rotate: 180,
            }}
          >
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </motion.div>
        </Button>
      </Flex>
    </HStack>
  );
}
