import { Box, Button, Flex, Link, Spinner } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import NextLink from 'next/link';
import { useMeQuery } from '../generated/graphql';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [{data, fetching}] = useMeQuery();
    let body = null;

    // Found a user
    if (data?.me?.id) {
        body = (
            <Flex>
                <Box mr={2}>Hey {data.me.username}</Box>
                <Button variant="link">Logout</Button>
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