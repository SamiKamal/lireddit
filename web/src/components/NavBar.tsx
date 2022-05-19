import { Box, Button, Flex, Link, Spinner } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [, logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery({
        pause: isServer()
    });
    let body = null;

    // Found a user
    if (data?.me?.id) {
        body = (
            <Flex>
                <Box mr={2}>Hey {data.me.username}</Box>
                <Button variant="link" onClick={() => logout()}>Logout</Button>
            </Flex>
        )
        // No user found
    } else {
        body = (<>
                <NextLink href="/login">
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link>Register</Link>
                </NextLink>
                </>)
    }
    
        return (
            <Flex bg="tan" p={4} ml="auto">
                <Box ml="auto">
                    {fetching ? <Spinner/> : (
                        body
                    )}
                </Box>
            </Flex>
        );
}