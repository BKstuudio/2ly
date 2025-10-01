import { DocumentNode, print } from 'graphql';
import { gql } from 'urql';

export const createSubscriptionFromQuery = (queryDoc: DocumentNode): DocumentNode => {
  const queryString = print(queryDoc);
  const subscriptionString = queryString.replace(/query\s+/, 'subscription ');
  return gql(subscriptionString);
};

export const escapeValue = (value: string) => {
  return value
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/"/g, '\\"'); // Escape double quotes
};
