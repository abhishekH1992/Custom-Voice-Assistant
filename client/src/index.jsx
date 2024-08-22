import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { BrowserRouter } from 'react-router-dom'
import './assets/scss/custom.scss';
import { ThemeProvider } from './context/ThemeContext';

const root = ReactDOM.createRoot(
    document.getElementById('root')
);

const client = new ApolloClient({
    // TODO - Change backend url to /graphql
    uri: "http://localhost:5000/graphql",
    cache: new InMemoryCache(),
    credentials: 'include'
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