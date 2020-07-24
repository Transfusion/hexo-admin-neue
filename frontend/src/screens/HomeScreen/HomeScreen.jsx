/* eslint-disable no-alert */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';

import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

import WatchUnwatchButton from '../../components/WatchUnwatchButton';
import { loadProfileInfo } from '../../reducers/authReducer';
import { setWatching } from '../../reducers/uiStateReducer';

import PostsScreen from '../PostsScreen/PostsScreen';
import PagesScreen from '../PagesScreen/PagesScreen';
import FileManagerScreen from '../FileManagerScreen/FileManagerScreen';
import SettingsScreen from '../SettingsScreen/SettingsScreen';

import AuthManager from '../../utils/managers/AuthManager';
import DataManager from '../../utils/managers/DataManager';
import SettingsManager from '../../utils/managers/SettingsManager';

import { SearchInContextProvider } from '../../utils/context/SearchInContextProvider';

// for the panels
import '../../styles/Resizer.css';
import './HomeScreen.css';

// or more accurately, the root screen...
class HomeScreen extends Component {
  componentDidMount() {
    this.updateAuthProfile();
    this.updateWatchState();

    // if exact match to /home, redirect to /home/posts
    const { history, match } = this.props;
    const { isExact } = match;
    if (isExact) {
      history.push('/home/posts');
    }
  }

  isNavLinkActive = (link) => {
    // return link === this.props.location.pathname;
    const { location } = this.props;
    return location.pathname.startsWith(link);
  }

  killServer = async () => {
    if (window.confirm('Are you sure you want to stop hexo-admin-neue? It is recommended to run hexo-admin-neue in conjunction with a process manager such as pm2 for auto-restart purposes.')) {
      const resp = await SettingsManager.killServer();
      if (resp.status === 204) {
        toast('hexo-admin-neue will stop shortly.');
      }
    }
  }

  generate = async () => {
    await DataManager.hexoGenerate();
    toast('Generated.');
  }

  deploy = async () => {
    const args = prompt('Enter any arguments to be passed to hexo deploy', '-m Commit Message');

    if (args === null) { return; }

    // TODO: tell the user to view the full error/stacktrace in the logs when that's implemented
    toast('Starting deployment... a notification will be shown after completion');

    try {
      const resp = await DataManager.hexoDeploy(args);
      if (resp.status === 204) {
        toast('Deployed.');
        return;
      }
    } catch (error) {
      const { response } = error;
      if (response?.data?.error) {
        toast(response.data.error);
        return;
      }
    }
    toast('An error occurred during deployment.');
  }

  clean = async () => {
    await DataManager.hexoClean();
    toast('Cleaned.');
  }

  // determines whether to show the auth button or not
  // TODO: move into a redux thunk?
  updateAuthProfile = async () => {
    const resp = await AuthManager.getAuthed();
    const { data } = resp;
    if (data.authenticated) {
      // eslint-disable-next-line react/destructuring-assignment
      this.props.loadProfileInfo(data.user);
    }
  }

  updateWatchState = async () => {
    const resp = await DataManager.hexoGetWatchStatus();
    const { watching } = resp.data;
    if (resp.status === 200) {
      // eslint-disable-next-line react/destructuring-assignment
      this.props.setWatching(watching);
    }
  }

  logout = async () => {
    await AuthManager.performLogout();
    window.location.reload();
  }

  render() {
    const { history, watching, profileInfo } = this.props;
    return (
      <div className="home-screen">
        <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
          <Navbar.Brand href="#">hexo-admin-neue</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link onClick={() => { history.push('/home/posts'); }} active={this.isNavLinkActive('/home/posts')}>Posts</Nav.Link>
              <Nav.Link onClick={() => { history.push('/home/pages'); }} active={this.isNavLinkActive('/home/pages')}>Pages</Nav.Link>
              <Nav.Link onClick={() => { history.push('/home/fileManager'); }} active={this.isNavLinkActive('/home/fileManager')}>File Manager</Nav.Link>
              <Nav.Link onClick={() => { history.push('/home/settings'); }}>Settings</Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown title="Hexo Commands" id="hexo-actions-nav-dropdown">
                <NavDropdown.Item target="blank" href="/">Preview</NavDropdown.Item>
                <WatchUnwatchButton BaseComponent={NavDropdown.Item} />
                <NavDropdown.Item onClick={this.clean}>
                  Clean
                  <i className="fa fa-broom pl-2" />
                </NavDropdown.Item>
                <NavDropdown.Item onClick={this.generate}>
                  Generate
                  <i className="fa fa-sync pl-2" />
                </NavDropdown.Item>
                <NavDropdown.Item onClick={this.deploy}>
                  Deploy
                  <i className="fa fa-upload pl-2" />
                </NavDropdown.Item>
                <NavDropdown.Item onClick={this.killServer}>
                  Kill Server
                  <i className="fa fa-times pl-2" />
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link target="blank" href="https://github.com/Transfusion/hexo-admin-neue">
                GitHub <i className="fab fa-github" />
              </Nav.Link>
              {!!profileInfo && <Nav.Link onClick={this.logout}>Logout</Nav.Link>}
              {/* <Nav.Link eventKey={2} href="#memes">
              Dank memes
            </Nav.Link> */}
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <div className="home-screen-content">
          {watching === false ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            >
              <h4>Watching has been paused.</h4>
            </div>
          ) : (
              <SearchInContextProvider>
                <Switch>
                  <Route path="/home/posts" component={PostsScreen} />
                  <Route path="/home/pages" component={PagesScreen} />
                  <Route path="/home/fileManager" component={FileManagerScreen} />
                  <Route path="/home/settings" component={SettingsScreen} />
                </Switch>
              </SearchInContextProvider>
            )}
          {/* <div style={{ flex: 1, backgroundColor: 'red' }} /> */}
        </div>

      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...ownProps,
  setWatching: (isWatching: boolean) => dispatch(setWatching(isWatching)),
  loadProfileInfo: (profileInfo) => { dispatch(loadProfileInfo(profileInfo)); },
});

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  watching: state.uiStateReducer.watching,
  profileInfo: state.authReducer.profileInfo,
});

HomeScreen.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  setWatching: PropTypes.func.isRequired,
  watching: PropTypes.bool,
  loadProfileInfo: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

HomeScreen.defaultProps = {
  watching: null,
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
