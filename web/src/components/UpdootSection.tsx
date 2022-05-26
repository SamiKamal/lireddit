import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React from 'react'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({post}) => {
    const  [, vote] = useVoteMutation();
    return (
            <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
                <IconButton 
                bgColor="transparent" 
                aria-label="Upvote post" 
                icon={<ChevronUpIcon />} 
                w={6} h={6}
                onClick={() => vote({value: 1, postId: post.id})}
                />
                    {post.points}
                <IconButton 
                bgColor="transparent" 
                aria-label="Downvote post" 
                icon={<ChevronDownIcon />} w={6} h={6} 
                onClick={() => vote({value: -1, postId: post.id})}
                />
            </Flex>

    );
}