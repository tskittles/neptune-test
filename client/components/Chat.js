import React, { Component } from 'react';
import { get } from '../ourLibrary-client';

class Chat extends Component {
  render() {
    return (
      <div id='chat'>
        <div>
          CHAT TEXT
        </div>
        <textarea type='text'></textarea>
        <button>Send</button>
      </div>
    );
  }
}

export default Chat;