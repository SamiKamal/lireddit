import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Layout } from '../components/Layout'
import { useCreatePostMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { useIsAtuh } from '../utils/useIsAuth'

const CreatePost: React.FC<{}> = ({}) => {
    const [, createPost] = useCreatePostMutation();
    const router = useRouter()
    useIsAtuh()

  return (
    <Layout>
        <Formik initialValues={{title: "", text: ""}} onSubmit={async (values, {setErrors}) => {
            const {error} = await createPost({options: values});
            
            if (!error) {
                router.push("/")
            }
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
  )
}

export default withUrqlClient(createUrqlClient)(CreatePost);