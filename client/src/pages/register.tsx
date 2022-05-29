import { Button,Box } from '@chakra-ui/react';
import React from 'react';
import {Formik, Form} from 'formik';
import { Wrapper } from '../components/wrapper';
import { InputField } from '../components/inputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface registerProps{}


const register: React.FC<registerProps> = ({}) => {
    const router = useRouter();
    const [, register] = useRegisterMutation();
    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{email: "", username: "", password: ""}}
                onSubmit={async (values, {setErrors}) => {
                    const response = await register({options: values});
                    if (response.data?.register.errors){
                        setErrors(toErrorMap(response.data.register.errors));
                    } else if (response.data?.register.user){
                        router.push("/")
                    }
                    return response;
                }}
            >
                {(props) => (
                <Form>
                    <InputField name = 'username' placeholder = 'username' label = 'Username'/>
                    <Box mt={4}>
                        <InputField name = 'email' placeholder = 'email' label = 'Email' type = 'Email'/>
                    </Box>
                    <Box mt={4}>
                        <InputField name = 'password' placeholder = 'password' label = 'Password' type = 'password'/>
                    </Box>
                    <Button
                        mt={4}
                        colorScheme='teal'
                        isLoading={props.isSubmitting}
                        type='submit'
                    >
                        Register
                    </Button>
                </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient) (register);