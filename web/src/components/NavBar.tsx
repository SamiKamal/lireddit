import { Box, Button, Flex, Heading, Link, Spinner } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter();
  const [logout] = useLogoutMutation();
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  let body = null;

  // Found a user
  if (data?.me?.id) {
    body = (
      <Flex>
        <Box mr={2}>Hey {data.me.username}</Box>
        <Button
          variant="link"
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
        >
          Logout
        </Button>
      </Flex>
    );
    // No user found
  } else {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  }

  return (
    <Flex bg="tan" p={4}>
      <Flex flex={1} m="auto" maxW={800} align="center">
        <NextLink href="/">
          <Link>
            <Heading>liReddiT</Heading>
          </Link>
        </NextLink>
        <Box ml="auto">{loading ? <Spinner /> : body}</Box>
      </Flex>
    </Flex>
  );
};
