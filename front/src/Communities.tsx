import React from 'react'
import { ApolloProvider, Subscription } from "react-apollo"
import ApolloClient from "apollo-client"
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'
const wsurl = 'ws://localhost:8080/v1alpha1/graphql'
const httpurl = 'http://localhost:8080/v1alpha1/graphql'

const COMMUNITIE_SUB = gql`
  subscription COMMUNITIE {
    communities {
      name
      description
    }
  }
`

interface CommunityData {
  name: string
  description: string
}

interface CommunitiesSubscriptionData {
  communities: [CommunityData]
}

class CommunitiesSubscription extends Subscription<CommunitiesSubscriptionData, {}> {}

export default ({token}: {token: string}) => {
  const headers = { Authorization: `Bearer ${token}` }

  const wsLink = new WebSocketLink({
    uri: wsurl,
    options: {
      reconnect: true,
      connectionParams: {
        headers
      }
    }
  })
  const httpLink = new HttpLink({
    uri: httpurl,
    headers
  })
  
  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    httpLink,
  )
  
  const client = new ApolloClient({
    link,
    cache: new InMemoryCache()
  })

  return (
    <ApolloProvider client={client}>
      <CommunitiesSubscription subscription={COMMUNITIE_SUB}>
        {({data, loading, error}) => {
          if (loading) return 'loading...'
          if (error) return 'error'

          return (
            <div>
              {data ? data.communities.map((community) => 
                <div>
                  <p>{community.name}</p>
                  <p>{community.description}</p>
                </div>
              ) : null}
            </div>
          )
        }}
      </CommunitiesSubscription>
    </ApolloProvider>
  )
}
