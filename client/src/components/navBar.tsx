import {Box, Button, Flex, Link} from '@chakra-ui/react';
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps{

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [{fetching: logoutFetching},logout] = useLogoutMutation();
    //Don't run Query request in server, run in browser.
    const [{data,fetching}] = useMeQuery({pause: isServer()})
    let body = null
    if(fetching){
        //Data is loading
    
    } else if (!data?.me){
        //User is not logged in
        body = (
            <>
            <NextLink href={'/login'}>
                <Link  mr={4}> Login</Link>
            </NextLink>
            <NextLink href={'/register'}>
                <Link  mr={4}> Register </Link>
            </NextLink>
            </>
        );
    } else{
        //User is logged in
        body = (
            <Flex>
                <Box mr={2}>{data.me.username}</Box>
                <Button isLoading={logoutFetching} variant= "link" onClick={() => {logout();}}>Logout</Button>
            </Flex>
        )
    }
    return (
        <Flex bg = 'tan' p={4}>
            <Box ml={"auto"}>
                {body}
            </Box>
        </Flex>
    )
}
