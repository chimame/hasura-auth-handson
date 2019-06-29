import React, { useState } from 'react';
import { ApolloProvider, Subscription, Mutation } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
const wsurl = 'ws://localhost:8080/graphql';
const httpurl = 'http://localhost:8080';

const COMMUNITIE_SUB = gql`
  subscription COMMUNITIE {
    communityAdded {
      name
      description
    }
  }
`;

const COMMUNITY_MUTATION = gql`
  mutation COMMUNITY($name: String!, $description: String) {
    createCommunity(input: { name: $name, description: $description }) {
      name
      description
    }
  }
`;

interface CommunityData {
  name: string;
  description: string;
}

interface CommunitiesSubscriptionData {
  communityAdded: [CommunityData];
}

class CommunitiesSubscription extends Subscription<
  CommunitiesSubscriptionData,
  {}
> {}
class CommunityMutation extends Mutation<CommunityData, CommunityData> {}

export default ({ token }: { token: string }) => {
  const headers = { Authorization: `Bearer ${token}` };

  const wsLink = new WebSocketLink({
    uri: wsurl,
    options: {
      reconnect: true,
      connectionParams: {
        headers
      }
    }
  });
  const httpLink = new HttpLink({
    uri: httpurl,
    headers
  });

  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink
  );

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache()
  });

  const [input, setInput] = useState<CommunityData>({
    name: '',
    description: ''
  });
  const handleInputChange = (type: 'name' | 'description') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInput({ ...input, [type]: e.target.value });
  };

  return (
    <ApolloProvider client={client}>
      <CommunityMutation mutation={COMMUNITY_MUTATION} variables={input}>
        {community => {
          const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            community();
          };
          return (
            <form onSubmit={handleSubmit}>
              <div>name</div>
              <div>
                <input
                  type="text"
                  value={input.name}
                  onChange={handleInputChange('name')}
                />
              </div>
              <div>description</div>
              <div>
                <input
                  type="text"
                  value={input.description}
                  onChange={handleInputChange('description')}
                />
              </div>
              <button type="submit">登録</button>
            </form>
          );
        }}
      </CommunityMutation>
      <CommunitiesSubscription subscription={COMMUNITIE_SUB}>
        {({ data, loading, error }) => {
          if (loading) return 'loading...';
          if (error) return 'error';

          return (
            <div>
              {data
                ? data.communityAdded.map(community => (
                    <div>
                      <p>{community.name}</p>
                      <p>{community.description}</p>
                    </div>
                  ))
                : null}
            </div>
          );
        }}
      </CommunitiesSubscription>
    </ApolloProvider>
  );
};
