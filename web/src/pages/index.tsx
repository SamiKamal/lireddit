import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { VariablesAreInputTypesRule } from "graphql";
import NextLink from "next/link";
import { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { PostsQuery, usePostsQuery } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";

const Index = () => {
  const { data, loading, error, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 15,
      cursor: null as string | null,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (error) {
    console.log(error);
    return <div>An error has occured, check the console.</div>;
  }

  return (
    <Layout>
      <Flex mb={4} align="center">
        <NextLink href="/create-post">
          <Button ml="auto">create post</Button>
        </NextLink>
      </Flex>
      <div>
        {loading && !data ? (
          "loading..."
        ) : (
          <Stack spacing={8}>
            {data?.posts.posts.map((post) => (
              <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection post={post} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={"/post/" + post.id}>
                    <Link>
                      <Heading fontSize="xl">{post.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text fontStyle="italic">
                    posted by: {post.creator.username}
                  </Text>
                  <Flex align="center">
                    <Text mt={4} flex={1}>
                      {post.textSnippet}
                    </Text>
                    <Box ml="auto">
                      <EditDeletePostButtons
                        creatorId={post?.creator?.id}
                        id={post.id}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            ))}
          </Stack>
        )}
        {data?.posts.hasMore ? (
          <Flex>
            <Button
              onClick={() =>
                fetchMore({
                  variables: {
                    limit: variables?.limit,
                    cursor:
                      data.posts.posts[data.posts.posts.length - 1].createdAt,
                  },
                  // updateQuery: (preValue, {fetchMoreResult}) => {
                  //   if (!fetchMoreResult) {
                  //     return preValue;
                  //   }
                  //   return {
                  //     __typename: 'Query',
                  //     posts: {
                  //       __typename: "PaginatedPosts",
                  //       hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
                  //       posts: [
                  //         ...preValue.posts.posts,
                  //         ...(fetchMoreResult as PostsQuery).posts.posts
                  //       ]
                  //     }
                  //   }
                  // }
                })
              }
              isLoading={loading}
              m="auto"
              my={8}
            >
              load more
            </Button>
          </Flex>
        ) : (
          ""
        )}
      </div>
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
