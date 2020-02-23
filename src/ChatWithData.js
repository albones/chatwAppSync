import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import uuid from "uuid/v4";

import { withUser } from "./helpers";
import Chat from "./Chat";

const CREATE_MESSAGE = gql`
  mutation createMessage($roomId: ID!, $when: String!, $content: String!) {
    createMessage(input: { roomId: $roomId, when: $when, content: $content }) {
      __typename
      id
      when
      content
      owner
      roomId
    }
  }
`;

const GET_ROOM_MESSAGES = gql`
  query GetRoomMessages($roomId: ID!) {
    getRoom(id: $roomId) {
      __typename
      messages(limit: 20, sortDirection: DESC) {
        __typename
        items {
          __typename
          id
          when
          content
          owner
        }
      }
    }
  }
`;

const CREATE_MESSAGES_SUB = gql`
  subscription OnCreateMessage($roomId: ID!) {
    onCreateMessage(roomId: $roomId) {
      __typename
      id
      when
      content
      owner
      roomId
    }
  }
`;

function ChatWithData({ match, username }) {
  return (
    <Query
      variables={{
        roomId: match.params.roomId
      }}
      query={GET_ROOM_MESSAGES}
      fetchPolicy="cache-and-network"
    >
      {({ data, subscribeToMore, ...results }) => (
        <Mutation mutation={CREATE_MESSAGE}>
          {mutate => (
            <Chat
              {...results}
              user={username}
              data={data}
              subscribeToNewMessages={() => {
                subscribeToMore({
                  document: CREATE_MESSAGES_SUB,
                  variables: {
                    roomId: match.params.roomId
                  },
                  updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev;
                    const newMessage = subscriptionData.data.onCreateMessage;
                    return Object.assign({}, prev, {
                      getRoom: {
                        ...prev.getRoom,
                        messages: {
                          ...prev.getRoom.messages,
                          items: [
                            newMessage,
                            ...prev.getRoom.messages.items.filter(
                              item => item.id !== newMessage.id
                            )
                          ]
                        }
                      }
                    });
                  }
                });
              }}
              onSend={content => {
                mutate({
                  variables: {
                    content,
                    roomId: match.params.roomId,
                    when: new Date()
                  },
                  optimisticResponse: () => ({
                    createMessage: {
                      __typename: "Message",
                      id: uuid(),
                      when: new Date(),
                      owner: username,
                      content
                    }
                  }),
                  update: (cache, { data: { createMessage } }) => {
                    const data = cache.readQuery({
                      query: GET_ROOM_MESSAGES,
                      variables: { roomId: match.params.roomId }
                    });
                    data.getRoom.messages.items = [
                      createMessage,
                      ...data.getRoom.messages.items.filter(
                        item => item.id !== createMessage.id
                      )
                    ];

                    cache.writeQuery({
                      query: GET_ROOM_MESSAGES,
                      variables: { roomId: match.params.roomId },
                      data
                    });
                  }
                });
              }}
            />
          )}
        </Mutation>
      )}
    </Query>
  );
}

export default withUser(ChatWithData);