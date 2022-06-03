import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import {NextPage} from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useState } from "react";
import { InputField } from "../../components/inputField";
import { Wrapper } from "../../components/wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";
import NextLink from 'next/link';

const ChangePassword: NextPage<{token: string}> = ({token}) => {
    const router = useRouter();
    const [,ChangePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState('')
    return (
    <Wrapper variant='small'>
        <Formik
            initialValues={{newPassword: ""}}
            onSubmit={async (values, {setErrors}) => {
                const response = await ChangePassword({newPassword: values.newPassword, token});
                if (response.data?.changePassword.errors){
                    const errorMap = toErrorMap(response.data.changePassword.errors);
                    if ('token' in errorMap){
                        setTokenError(errorMap.token);
                    }
                    setErrors(errorMap);
                } else if (response.data?.changePassword.user){
                    router.push("/")
                }
            }}
        >
        {(props) => (
        <Form>
            <InputField 
                name = 'newPassword' 
                placeholder = 'new password' 
                label = 'New Password'
                type="password"
            />
            {tokenError ? (
                <Flex>
                    <Box mr={2} color='red'>{tokenError}</Box> 
                    <NextLink href="/forgot-password">
                        <Link>get new one</Link>
                    </NextLink>
                </Flex>
            ) : null}
            <Button
                mt={4}
                colorScheme='teal'
                isLoading={props.isSubmitting}
                type='submit'
            >
                Change Password
            </Button>
        </Form>
        )}
    </Formik>
</Wrapper>);
};

ChangePassword.getInitialProps = ({query}) => {
    return{
        token: query.token as string
    }
}

export default withUrqlClient(createUrqlClient, {ssr: false}) (ChangePassword);