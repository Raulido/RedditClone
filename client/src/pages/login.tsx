import {
    Button,
    Box,
    Link,
    Flex,
  } from '@chakra-ui/react';
import React from 'react';
import {Formik, Form} from 'formik';
import { Wrapper } from '../components/wrapper';
import { InputField } from '../components/inputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';


const login: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation();
    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{usernameOrEmail: "", password: ""}}
                onSubmit={async (values, {setErrors}) => {
                    const response = await login(values);
                    if (response.data?.login.errors){
                        setErrors(toErrorMap(response.data.login.errors));
                    } else if (response.data?.login.user){
                        router.push("/")
                    }
                    return response;
                }}
            >
                {(props) => (
                <Form>
                    <InputField name = 'usernameOrEmail' placeholder = 'username or email' label = 'Username or Email'/>
                    <Box mt={4}>
                        <InputField name = 'password' placeholder = 'password' label = 'Password' type = 'password'/>
                    </Box>
                    <Flex mt={2}>
                        <NextLink href="/forgot-password">
                            <Link ml='auto'>Forgot Password?</Link>
                        </NextLink>
                    </Flex>
                    <Button
                        mt={4}
                        colorScheme='teal'
                        isLoading={props.isSubmitting}
                        type='submit'
                    >
                        Login
                    </Button>
                </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient) (login);