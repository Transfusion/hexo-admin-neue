import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router';

const AuthRoute = (props) => {
  const { previouslyAuthenticated } = props;
  // if (previouslyAuthenticated) return <Redirect to="/home" />;
  // else if (previouslyAuthenticated) return <Redirect to="/" />;

  if (previouslyAuthenticated) {
    return <Route {...props} />;
  }
  return <Redirect to="/login" />;
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  previouslyAuthenticated: !!localStorage.getItem('profile'),
});

export default connect(mapStateToProps)(AuthRoute);
