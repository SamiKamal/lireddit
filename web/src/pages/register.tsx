import React from 'react'
import {Formik, Form} from 'formik';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { Box, Button } from '@chakra-ui/react';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface registerProps {

}



const Register: React.FC<registerProps> = ({}) => {
    const router = useRouter();
    const [, register] = useRegisterMutation();
        return (
            <Wrapper>
                <Formik initialValues={{username: "", password: "", email: ""}} onSubmit={async (values, {setErrors}) => {
                    const response = await register({options: values})
                    if (response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors));
                    } else if (response.data?.register.user) {
                        router.push('/')
                    }
                    
                }}>
                    {({isSubmitting}) => (
                        <Form>
                            <InputField
                                name='username'
                                placeholder='username'
                                label="Username"
                            />
                            <Box mt={4}>
                                <InputField
                                    name='email'
                                    placeholder='email'
                                    label="Email"
                                    type="text"
                                />
                            </Box>
                            <Box mt={4}>
                                <InputField
                                    name='password'
                                    placeholder='password'
                                    label="Password"
                                    type="password"
                                />
                            </Box>
                            <Button mt={4} type="submit" isLoading={isSubmitting} backgroundColor="teal">Register</Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        );
}
export default withUrqlClient(createUrqlClient)(Register);