import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React from 'react'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({post}) => {
    const  [, vote] = useVoteMutation();
    console.log(post);
    
    return (
            <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
                <IconButton 
                colorScheme={post.voteStatus === 1 ? "green" : undefined}
                aria-label="Upvote post" 
                icon={<ChevronUpIcon />} 
                w={6} h={6}
                onClick={() => {
                    if (post.voteStatus === 1) return;
                    vote({value: 1, postId: post.id})
                }}
                />
                    {post.points}
                <IconButton 
                aria-label="Downvote post"
                colorScheme={post.voteStatus === -1 ? "red" : undefined}
                icon={<ChevronDownIcon />} w={6} h={6} 
                onClick={() => {
                    if (post.voteStatus === -1) return;
                    vote({value: -1, postId: post.id})
                }}
                />
            </Flex>

    );
}