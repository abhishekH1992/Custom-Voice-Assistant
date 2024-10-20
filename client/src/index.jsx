import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom'
import './assets/scss/custom.scss';
import { ThemeProvider } from './context/ThemeContext';

import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const root = ReactDOM.createRoot(
    document.getElementById('root')
);
// Set up the backend URLs
const httpUri = process.env.NODE_ENV === 'production' ? `${process.env.REACT_APP_GRAPHQL_HTTP_URI}` : 'http://localhost:5000/graphql';
const wsUri = process.env.NODE_ENV === 'production' ? `${process.env.REACT_APP_GRAPHQL_WS_URI}` : 'ws://localhost:5000/graphql';

// Create an auth link that adds the token to the headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const httpLink = new HttpLink({
    uri: httpUri
});

// Combine the auth link with the http link
const httpAuthLink = authLink.concat(httpLink);

const wsLink = new GraphQLWsLink(createClient({
    url: wsUri,
    connectionParams: () => {
        const token = localStorage.getItem('token');
        return {
            authorization: token ? `Bearer ${token}` : "",
        }
    },
    on: {
        closed: () => {
            console.log("WebSocket closed. Attempting to reconnect...");
            // Reconnection logic can go here
        },
        error: (error) => {
            console.error("WebSocket encountered an error:", error);
        }
    }
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
    httpAuthLink,
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