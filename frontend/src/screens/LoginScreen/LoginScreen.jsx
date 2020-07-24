import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  Button, Form, FormControl,
} from 'react-bootstrap';
import AuthManager from '../../utils/managers/AuthManager';
import SettingsManager from '../../utils/managers/SettingsManager';

import { Config } from '../../utils/Config';

import './LoginScreen.css';

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null,

      // showPassword: false,
    };
  }

  componentDidMount() {
    const { history } = this.props;
    // check if still logged in, then navigate to the home screen view
    if (localStorage.getItem(Config.localStorageProfileKey)) {
      history.push('/home');
    } else {
      (async () => {
        const resp = await AuthManager.getAuthed();
        const { data } = resp;
        if (!data.authenticated && !data.passwordProtected) {
          localStorage.setItem(Config.localStorageProfileKey,
            JSON.stringify({ username: 'anonymous', loginDt: new Date() }));
          // navigate to home/posts
          history.push('/home/posts');
        }
      })();
    }
  }

  performLogin = async (e) => {
    e.preventDefault();

    const { history } = this.props;
    const { username, password } = this.state;
    const res = await AuthManager.performLogin(username, password);
    if (res?.data.success) {
      // update the profile into localstorage
      localStorage.setItem(Config.localStorageProfileKey,
        JSON.stringify({ username, loginDt: new Date() }));
      // navigate to home/posts
      history.push('/home/posts');
    }
  }

  render() {
    const { username, password } = this.state;
    return (
      <div className="login-screen">
        <h2>hexo-admin-neue</h2>
        <span>by transfusion</span>

        <div className="pt-3" style={{ display: 'flex', flexDirection: 'column' }}>

          <form onSubmit={this.performLogin}>
            <Form.Group controlId="email" bsSize="large">
              <Form.Label>Username</Form.Label>
              <FormControl
                autoFocus
                placeholder="Username"
                // type="email"
                value={username}
                onChange={(event) => this.setState({ username: event.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="password" bsSize="large">
              <Form.Label>Password</Form.Label>
              <FormControl
                value={password}
                placeholder="Password"
                onChange={(event) => this.setState({ password: event.target.value })}
                type="password"
              />
            </Form.Group>
            <Button block bsSize="large" type="submit">
              Login
            </Button>
          </form>


        </div>

      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...ownProps,
});

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  previouslyAuthenticated: !!localStorage.getItem('profile'),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
