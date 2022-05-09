import {Box, Flex, Link} from '@chakra-ui/react';
import React from "react";
import NextLink from "next/link";

interface NavBarProps{

}

export const NavBar: React.FC<NavBarProps> = ({}) => {

    return (
        <Flex bg = 'tomato' p={4}>
            <Box ml={"auto"}>
                <NextLink href={'/login'}>
                    <Link  mr={4}> Login</Link>
                </NextLink>
                <NextLink href={'/register'}>
                    <Link  mr={4}> Register </Link>
                </NextLink>
            </Box>
            

        </Flex>
    )

}
