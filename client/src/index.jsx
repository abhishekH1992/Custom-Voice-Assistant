import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloProvider } from '@apollo/client'
import { BrowserRouter } from 'react-router-dom'
import './assets/scss/custom.scss';
import { ThemeProvider } from './context/ThemeContext';
import apolloClient from './utils/apolloClient';

const root = ReactDOM.createRoot(
    document.getElementById('root')
);

const client = apolloClient;

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