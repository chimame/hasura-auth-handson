import React from 'react'
import { ApolloProvider } from "react-apollo"
import ApolloClient from "apollo-client"
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
const wsurl = 'ws://localhost:8080/v1alpha1/graphql'
const httpurl = 'http://localhost:8080/v1alpha1/graphql'

const wsLink = new WebSocketLink({
  uri: wsurl,
  options: {
    reconnect: true
  }
})
const httpLink = new HttpLink({
  uri: httpurl,
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

export default () => {
  return (
    <ApolloProvider client={client}>
    </ApolloProvider>
  )
}
