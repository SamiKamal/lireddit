import React from 'react'
import {useMutation} from 'urql';
import {Formik, Form} from 'formik';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { Box, Button } from '@chakra-ui/react';
import { useRegisterMutation } from '../generated/graphql';

interface registerProps {

}



const Register: React.FC<registerProps> = ({}) => {
    const [, register] = useRegisterMutation();
        return (
            <Wrapper>
                <Formik initialValues={{username: "", password: ""}} onSubmit={ (values) => {
                    return register(values)
                    
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
export default Register;