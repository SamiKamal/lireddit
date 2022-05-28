import { Box, Button, Heading, Spinner } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIndId } from '../../../utils/useGetIntId';

interface EditPostProps {

}

const EditPost: React.FC<EditPostProps> = ({}) => {
    const router = useRouter();
    const id = useGetIndId();
    const [{data, fetching}] = usePostQuery({
        pause: id === -1,
        variables: {
                id
        }
    })
    const [, updatePost] = useUpdatePostMutation();

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
                <Formik initialValues={{title: data.post.title, text: data.post.text}} onSubmit={async ({text, title}, {setErrors}) => {
                    const {error} = await updatePost({id, text, title});
                    
                    if (!error) {
                        router.push("/post/" + data.post?.id)
                    }

                    console.log(error);
                    
                }}>
                    {({isSubmitting}) => (
                        <Form>
                            <InputField
                                name='title'
                                placeholder='title'
                                label="Title"
                            />
                            <Box mt={4}>
                                <InputField
                                    name='text'
                                    placeholder='text...'
                                    label="Body"
                                    textarea
                                />
                            </Box>
                            <Button mt={4} type="submit" isLoading={isSubmitting} backgroundColor="teal">Post</Button>
                        </Form>
                    )}
                </Formik>
            </Layout>
        );
}

export default withUrqlClient(createUrqlClient)(EditPost);