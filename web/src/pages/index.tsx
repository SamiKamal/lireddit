import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/Layout";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link'
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{data,fetching, error}] = usePostsQuery({
    variables: {
      limit: 10
    }
  });

  if (error) {
    console.log(error);
    return <div>An error has occured, check the console.</div>
  }

  return (<Layout>
    <Flex mb={4} align="center">
      <Heading>liReddiT</Heading>
      <NextLink href="/create-post">
        <Link textDecoration="underline" ml="auto">
          create post
        </Link>
      </NextLink>
    </Flex>
    <div>
      {fetching && !data ? 'loading...' : (
        <Stack spacing={8}>
          {data?.posts.map((post) => (
            <Box key={post.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data ? (<Flex>
        <Button isLoading={fetching} m="auto" my={8}>load more</Button>
      </Flex>) : ''}
    </div>
  </Layout>)
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
