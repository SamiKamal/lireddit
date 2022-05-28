import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from 'next/link';
import { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as string | null
  })
  const [{data,fetching, error, stale}] = usePostsQuery({
    variables
  });
  const [{data: user}] = useMeQuery();

  if (error) {
    console.log(error);
    return <div>An error has occured, check the console.</div>
  }
  
  return (<Layout>
    <Flex mb={4} align="center">
      <NextLink href="/create-post">
        <Button ml="auto">
          create post
        </Button>
      </NextLink>
    </Flex>
    <div>
      {fetching && !data ? 'loading...' : (
        <Stack spacing={8}>
          {data?.posts.posts.map((post) => (
            <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={post} />
              <Box flex={1}>
                <NextLink href='/post/[id]' as={'/post/' + post.id}>
                  <Link>
                    <Heading fontSize="xl">{post.title}</Heading>
                  </Link>
                </NextLink>
                <Text fontStyle="italic">posted by: {post.creator.username}</Text>
                <Flex align="center">
                  <Text mt={4} flex={1}>{post.textSnippet}</Text>
                    {post.creator.id === user?.me?.id ? (
                      <Box ml="auto">
                        <EditDeletePostButtons id={post.id}/>\
                      </Box>
                    ) : null}

                </Flex>
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
