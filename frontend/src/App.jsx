import React from 'react';
import { Provider } from 'react-redux';

// https://stackoverflow.com/questions/56707885/browserrouter-vs-router-with-history-push
import {
  Router, Switch, Redirect, Route,
} from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';
import { Config } from './utils/Config';
import 'react-toastify/dist/ReactToastify.css';

import history from './utils/history';

import './App.css';
import store from './utils/managers/ReduxStorageManager';
import AuthRoute from './utils/AuthRoute';
import LandingRoute from './utils/LandingRoute';

import LoginScreen from './screens/LoginScreen/LoginScreen';
import HomeScreen from './screens/HomeScreen/HomeScreen';

import 'bootstrap/dist/css/bootstrap.min.css';
// import 'font-awesome/css/font-awesome.min.css';

import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Provider store={store}>
      <ToastContainer />
      <Router history={history} basename={Config.routerBase}>
        <>
          <Switch>
            <Route path="/login" component={LoginScreen} />
            <AuthRoute path="/home" component={HomeScreen} />
            <LandingRoute />
          </Switch>
        </>
      </Router>
    </Provider>
  );
}

export default App;
