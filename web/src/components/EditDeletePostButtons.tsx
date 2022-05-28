import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, IconButton } from '@chakra-ui/react';
import React from 'react'
import NextLink from 'next/link'
import { useDeletePostMutation } from '../generated/graphql';

interface EditDeletePostButtonsProps {
    id: number

}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({id}) => {
      const [, deletePost] = useDeletePostMutation()
        return (
            <Box>
                <IconButton 
                icon={<DeleteIcon />} 
                aria-label="Delete Post" 
                mr={4}
                onClick={() => deletePost({id})}
                />
                <NextLink href="/post/edit/[id]" as={"/post/edit/" + id}>
                <IconButton
                    icon={<EditIcon />} 
                    aria-label="Edit Post" 
                />
                </NextLink>
            </Box>

        );
}