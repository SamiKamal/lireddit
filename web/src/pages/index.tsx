import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/Layout";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link'
import { usePostsQuery } from "../generated/graphql";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { UpdootSection } from "../components/UpdootSection";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as string | null
  })
  const [{data,fetching, error, stale}] = usePostsQuery({
    variables
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
          {data?.posts.posts.map((post) => (
            <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={post} />
              <Box>
                <NextLink href='/post/[id]' as={'/post/' + post.id}>
                  <Link>
                    <Heading fontSize="xl">{post.title}</Heading>
                  </Link>
                </NextLink>
                <Text fontStyle="italic">posted by: {post.creator.username}</Text>
                <Text mt={4}>{post.textSnippet}</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data?.posts.hasMore ? (<Flex>
        <Button onClick={() => setVariables({
          limit: variables.limit,
          cursor: data?.posts.posts[data.posts.posts.length - 1].createdAt
        })} isLoading={fetching || stale} m="auto" my={8}>load more</Button>
      </Flex>) : ''}
    </div>
  </Layout>)
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
