"use client";

import { Box, Flex, Link as ChakraLink, Spacer, Button } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Explore", href: "/explore" },
    { name: "Leaderboards", href: "/leaderboards" },
    { name: "Workouts", href: "/workouts" },
    { name: "Chat", href: "/chat" },
];

const Navbar = () => {
    const pathname = usePathname();

    return (
        <Box
            bg="gray.900"
            px={6}
            py={4}
            color="white"
            borderBottomWidth="1px"
            borderBottomColor="gray.700"
            borderBottomStyle="solid"
            height="35px"
            display="flex"
            alignItems="center"
        >
            <Flex align="center">
                <Box fontSize="xl" fontWeight="bold">
                    Formsync
                </Box>

                {/* Add marginLeft or spacing here */}
                <Flex gap={4} ml={8}>
                    {navItems.map((item) => (
                        <ChakraLink
                            as={Link}
                            key={item.href}
                            href={item.href}
                            fontWeight={pathname === item.href ? "bold" : "normal"}
                            transition="color 0.2s ease-in-out"
                            _hover={{
                                color: "gray.400",         // or blue.600, or whatever color you want
                                textDecoration: "none", // disable underline
                            }}
                        >

                            {item.name}
                        </ChakraLink>
                    ))}
                </Flex>
            </Flex>
        </Box>

    );
};

export default Navbar;
