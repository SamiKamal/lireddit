import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const ForgotPassword: React.FC<{}> = ({}) => {
    const [isComplete, setIsComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();
        return (
            <Wrapper>
                <Formik initialValues={{email: ""}} onSubmit={async ({email}, {setErrors}) => {
                    if (!email) {
                        return setErrors({email: "Please enter an email"})
                    }
                    const response = await forgotPassword({email});
                    setIsComplete(true);            
                    
                }}>
                    {({isSubmitting}) => ( isComplete ? (<Box>If the email exists, we sent you an email</Box>):
                        <Form>
                            <Box mt={4}>
                                <InputField
                                    name='email'
                                    placeholder='email'
                                    label="Email"
                                    type="email"
                                />                                
                            </Box>
                            <Button mt={4} type="submit" isLoading={isSubmitting} backgroundColor="teal">Request change</Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);