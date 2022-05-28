import { Heading, Spinner } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { Layout } from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';

interface PostProps {

}

const Post: React.FC<PostProps> = ({}) => {
        const router = useRouter();
        const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
        const [{data, fetching}] = usePostQuery({
                pause: intId === -1,
                variables: {
                        id: intId
                }
        })


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
                        <Heading>{data?.post?.title}</Heading>
                        {data?.post?.text}
                </Layout>
        );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);