import React, { Component } from "react";
import AWSAppSyncClient from "aws-appsync";
import Amplify, { Auth } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloHooksProvider } from "react-apollo-hooks";
import { Rehydrated } from "aws-appsync-react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import AppSyncConfig from "./aws-exports";
import Rooms from "./Rooms";
//import Chat from "./Chat";
import ChatWithData from "./ChatWithData";






Amplify.configure(AppSyncConfig);

const client = new AWSAppSyncClient({
  url: AppSyncConfig.aws_appsync_graphqlEndpoint,
  region: AppSyncConfig.aws_appsync_region,
  auth: {
    type: AppSyncConfig.aws_appsync_authenticationType,
    credentials: () => Auth.currentCredentials(),
    jwtToken: async () =>
      (await Auth.currentSession()).getAccessToken().getJwtToken()
  },
  complexObjectsCredentials: () => Auth.currentCredentials()
});

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <ApolloHooksProvider client={client}>
        <Rehydrated>
          <Router>
            <Switch>
              <Route path="/room/:roomId" component={ChatWithData} />
              <Route path="/" component={Rooms} />
            </Switch>
          </Router>
        </Rehydrated>
        </ApolloHooksProvider>
      </ApolloProvider>
    );
  }
}

export default withAuthenticator(App);