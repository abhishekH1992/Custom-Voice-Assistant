import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom'
import './assets/scss/custom.scss';
import { ThemeProvider } from './context/ThemeContext';
import { ApolloProvider } from '@apollo/client';
import apolloClient from './utils/apolloClient.util';

const root = ReactDOM.createRoot(
    document.getElementById('root')
);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <ApolloProvider client={apolloClient}>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </ApolloProvider>
        </BrowserRouter>
    </React.StrictMode>
);