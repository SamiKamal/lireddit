import { ApolloCache, gql } from "@apollo/client";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React from "react";
import {
  PostSnippetFragment,
  useVoteMutation,
  VoteMutation,
} from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const updateAfterVote = (
  value: 1 | -1,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<PostSnippetFragment>({
    id: "Post:" + postId,
    fragment: gql`
      fragment __ on Post {
        id
        points
        voteStatus
      }
    `,
  });
  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints = data.points + (!data.voteStatus ? 1 : 2) * value;
    cache.writeFragment({
      id: "Post:" + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [vote] = useVoteMutation();

  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        aria-label="Upvote post"
        icon={<ChevronUpIcon />}
        w={6}
        h={6}
        onClick={() => {
          if (post.voteStatus === 1) return;
          vote({
            variables: { value: 1, postId: post.id },
            update: (cache) => updateAfterVote(1, post.id, cache),
          });
        }}
      />
      {post.points}
      <IconButton
        aria-label="Downvote post"
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        icon={<ChevronDownIcon />}
        w={6}
        h={6}
        onClick={() => {
          if (post.voteStatus === -1) return;
          vote({
            variables: { value: -1, postId: post.id },
            update: (cache) => updateAfterVote(-1, post.id, cache),
          });
        }}
      />
    </Flex>
  );
};
