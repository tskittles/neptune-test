import React, { Component } from 'react';
import { set, get, query } from '../ourLibrary-client';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      password: '',
    };
  }

  handleUser(event) {
    this.setState({ user: event.target.value });
  }

  handlePassword(event) {
    this.setState({ password: event.target.value });
  }

  handleLogin() {
    query('login', data => {
      if (data.error) {
        alert(data.error);
      } else {
        if (data.response.length === 0) {
          alert('incorrect login');
        } else {
          console.log(data.response[0].username);
          set('username', data.response[0].username); // **I'm think this should be using local state OR
          // it must be kept in sync with the database
          // and then questionable whether we need a set AND query method
          // can we whiteboard out when you would use query (one liner with possible response)
          // versus set (two liner with response specific in advance) !
        }
      }
    }, [this.state.user, this.state.password]);
  }

  handleRegister() {
    query('register', data => {
      if (data.error) {
        console.log(data.error);
      } else {
        set('username', this.state.user);
      }
    }, [this.state.user, this.state.password]);
  }

  render() {
    if (get('username')) {
      return (
        <div>
          You are logged in as: <strong>{get('username')}</strong>
        </div>
      );
    } else {
      return (
        <div id='login'>
          <input value={this.state.user} onChange={this.handleUser.bind(this)} type='text' />
          <input value={this.state.password} onChange={this.handlePassword.bind(this)} type='password' />
          <button onClick={this.handleLogin.bind(this)}>Login</button>
          <button onClick={this.handleRegister.bind(this)}>Register</button>
        </div>
      );
    }
  }
}

export default Login;
