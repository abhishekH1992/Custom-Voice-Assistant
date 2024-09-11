import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { BrowserRouter } from 'react-router-dom'
import './assets/scss/custom.scss';
import { ThemeProvider } from './context/ThemeContext';

import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const root = ReactDOM.createRoot(
    document.getElementById('root')
);

// const client = new ApolloClient({
//     // TODO - Change backend url to /graphql
//     uri: "http://localhost:5000/graphql",
//     cache: new InMemoryCache(),
//     credentials: 'include'
// });

const httpLink = new HttpLink({
    uri: 'http://localhost:5000/graphql'
});
  
const wsLink = new GraphQLWsLink(createClient({
    url: 'ws://localhost:5000/graphql',
}));
  
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink,
);
  
const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache()
});

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <ApolloProvider client={client}>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </ApolloProvider>
        </BrowserRouter>
    </React.StrictMode>
);