import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';


export const ChangePassword: NextPage<{token: string}> = ({token}) => {
    const router = useRouter();
    const [, changePassword] = useChangePasswordMutation()
    const [tokenError, setTokenError] = useState('')
        return (
            <Wrapper>
                <Formik initialValues={{newPassword: ""}} onSubmit={async ({newPassword}, {setErrors}) => {
                    const response = await changePassword({token, password: newPassword});
                    if (response.data?.changePassword.errors) {
                        const errorMap = toErrorMap(response.data.changePassword.errors);
                        if ('token' in errorMap) {
                            setTokenError(errorMap.token)
                        }
                        setErrors(errorMap);
                    } else if (response.data?.changePassword.user) {
                        router.push('/')
                    }
                    
                }}>
                    {({isSubmitting}) => (
                        <Form>
                            <Box mt={4}>
                                <InputField
                                    name='newPassword'
                                    placeholder='New Password'
                                    label="New Password"
                                    type="password"
                                />
                                <Box color={"red"}>{tokenError}</Box>
                            </Box>
                            <Button mt={4} type="submit" isLoading={isSubmitting} backgroundColor="teal">Change password</Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        )}

ChangePassword.getInitialProps = ({query}) => {
    return {
        token: query.token as string
    }
}

export default withUrqlClient(createUrqlClient)(ChangePassword);