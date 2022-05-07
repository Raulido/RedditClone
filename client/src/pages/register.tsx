import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    Button,
    Box,
  } from '@chakra-ui/react';
import React from 'react';
import {Formik, Form, Field} from 'formik';
import { Wrapper } from '../components/wrapper';
import { InputField } from '../components/inputField';

interface registerProps{}


const register: React.FC<registerProps> = ({}) => {
    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{username: "", password: ""}}
                onSubmit={(values, actions) => {
                setTimeout(() => {
                    console.log(values)
                    // alert(JSON.stringify(values, null, 2))
                    // actions.setSubmitting(false)
                }, 1000)
                }}
            >
                {(props) => (
                <Form>
                    <InputField name = 'username' placeholder = 'username' label = 'Username'/>
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

export default register;