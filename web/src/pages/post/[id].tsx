import { Box, Heading, Spinner } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import React from 'react'
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { usePostQueryFromUrl } from '../../utils/usePostQueryFromUrl';

interface PostProps {

}

const Post: React.FC<PostProps> = ({}) => {
        const [{data, fetching}] = usePostQueryFromUrl()


        if (fetching) {
                return (
                        <Layout>
                                <Spinner />
                        </Layout>
                )
        }

        if (!data?.post) {
                return (
                        <Layout>
                                <Heading>Sorry, we couldn't find that post</Heading>
                        </Layout>
                )
        }

        return (
                <Layout>
                        <Heading mb={4}>{data?.post?.title}</Heading>
                        <Box mb={4}>
                                {data?.post?.text}
                        </Box>
                        <EditDeletePostButtons id={data.post.id} />
                </Layout>
        );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);