import { GiftedChat } from "react-web-gifted-chat";
import React from "react";

class Chat extends React.Component {
  componentDidMount() {
    this.props.subscribeToNewMessages();
  }

  onSend(messages = []) {
    messages.map(m => this.props.onSend(m.text));
  }

  render() {
    const { loading, error, data, user } = this.props;
    if (error) return <div>{error.message}</div>;
    if (loading) return <div>Loading</div>;

    const messages = data.getRoom.messages.items;
    return (
      <div style={styles.container}>
        <GiftedChat
          messages={messages.map(m => ({
            id: m.id,
            text: m.content,
            createdAt: new Date(m.when),
            user: {
              id: m.owner,
              name: m.owner
            }
          }))}
          onSend={messages => this.onSend(messages)}
          user={{
            id: user
          }}
        />
      </div>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    height: "100vh"
  }
};

export default Chat;