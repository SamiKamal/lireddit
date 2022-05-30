import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId?: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const { data } = useMeQuery();
  const [deletePost] = useDeletePostMutation();
  if (data?.me?.id !== creatorId) {
    return null;
  }
  return (
    <Box>
      <IconButton
        icon={<DeleteIcon />}
        aria-label="Delete Post"
        mr={4}
        onClick={() =>
          deletePost({
            variables: { id },
            update: (cache) => {
              cache.evict({ id: "Post:" + id });
            },
          })
        }
      />
      <NextLink href="/post/edit/[id]" as={"/post/edit/" + id}>
        <IconButton icon={<EditIcon />} aria-label="Edit Post" />
      </NextLink>
    </Box>
  );
};
