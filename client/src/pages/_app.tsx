import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';
import { AppProps } from 'next/app';
import { Provider, createClient, dedupExchange, fetchExchange} from 'urql';
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';

//Wrapper function for updateQuery so TypeScript doesnt complain
function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query ) => Query
){
  return cache.updateQuery(qi, data => fn( result, data as any) as any)
}

const client = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: "include",
  }, 
  exchanges: [dedupExchange, cacheExchange({
    //Need to update our query after a mutation fires. 
    //This fixes the issue of login and NavBar not changing.
    updates: {
      Mutation: {
        logout: (_result, args, cache, info) => {
          // me query should return null
          betterUpdateQuery<LogoutMutation, MeQuery>(
            cache,
            {query: MeDocument},
            _result,
            () => ({me: null})
          )
        },
        login : (_result, args, cache, info) => {
          betterUpdateQuery<LoginMutation, MeQuery>(
            cache,
            {query: MeDocument},
            _result,
            (result, query) => {
              if (result.login.errors){
                return query
              } else {
                return {
                  me: result.login.user,
                };
              }
            }
          );
        },
        register : (_result, args, cache, info) => {
          betterUpdateQuery<RegisterMutation, MeQuery>(
            cache,
            {query: MeDocument},
            _result,
            (result, query) => {
              if (result.register.errors){
                return query
              } else {
                return {
                  me: result.register.user,
                };
              }
            }
          );
        },

      },
    }
  }), fetchExchange]
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  )
}

export default MyApp
