import { gql } from "@apollo/client";

export const GET_ENABLE_TYPES = gql`
    query GetEnableTypes($isActive: Boolean) {
        types(isActive: $isActive) {
            id
            name
            description
            isAudio
            duration
            isText
            icon
            isAutomatic
            isContinous
        }
    }
`;