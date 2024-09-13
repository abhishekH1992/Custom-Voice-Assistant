import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            user {
                id
                firstName
                lastName
                email
            }
        }
    }
`;

export const REGISTER_MUTATION = gql`
    mutation Register($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
        register(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
            token
            user {
                id
                firstName
                lastName
                email
            }
        }
    }
`;