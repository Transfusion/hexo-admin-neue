/* eslint-disable no-alert */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import bcrypt from 'bcryptjs';

import './SettingsScreen.css';

class SettingsScreen extends Component {
  constructor(props) {
    super(props);
    const hash = (() => bcrypt.hashSync('sample_password', bcrypt.genSaltSync(10)))();
    this.state = {
      username: 'Sample',
      password: 'sample_password',
      secret: 's4mp!e_53c7et',
      hash,
    };
  }

  updateSaltedHash() {
    const { password } = this.state;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err_, hash) => {
        // Store hash in your password DB.
        this.setState({ hash });
      });
    });
  }

  render() {
    const { profileInfo } = this.props;
    const {
      username, password, secret, hash,
    } = this.state;
    return (
      <div className="settings-screen">
        <div className="settings-block">
          <h3>Authentication</h3>
          {!!profileInfo && <p className="text-success">You already have authentication enabled.</p>}

          <div className="pb-2">
            <p>
              Enter a username, password, and random string below, then
              copy and paste the generated block into your
              {' '}
              <code>_config.yml</code>
              {' '}
              to enable authentication for hexo-admin-neue.
            </p>

            <InputGroup className="mb-3 settings-input-field">
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1"><i className="fa fa-user" /></InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                onChange={(e) => { this.setState({ username: e.target.value }); }}
                value={username}
                placeholder="Username"
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
            </InputGroup>

            <InputGroup className="mb-3 settings-input-field">
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1"><i className="fa fa-lock" /></InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                onChange={(e) => {
                  this.setState({ password: e.target.value }, () => {
                    this.updateSaltedHash();
                  });
                }}
                value={password}
                placeholder="Password"
                aria-label="Password"
                aria-describedby="basic-addon1"
              />
            </InputGroup>

            <InputGroup className="mb-3 settings-input-field">
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1"><i className="fa fa-user-secret" /></InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                onChange={(e) => { this.setState({ secret: e.target.value }); }}
                value={secret}
                placeholder="Secret"
                aria-label="Secret"
                aria-describedby="basic-addon1"
              />
            </InputGroup>
          </div>

          <pre className="authentication-code-block">
            # hexo-admin-neue authentication
            {'\n'}
            admin:
            {'\n    '}
            username:
            {' '}
            {username}
            {'\n    '}
            password_hash:
            {' '}
            {hash}
            {'\n    '}
            secret:
            {' '}
            {secret}
          </pre>

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
  watching: state.uiStateReducer.watching,
  profileInfo: state.authReducer.profileInfo,
});


SettingsScreen.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  profileInfo: PropTypes.string,
};

SettingsScreen.defaultProps = {
  profileInfo: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);
