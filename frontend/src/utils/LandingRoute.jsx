import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';

const LandingRoute = (props) => {
  const { previouslyAuthenticated } = props;

  if (previouslyAuthenticated) {
    return <Redirect to="/home/posts" />;
  }
  return <Redirect to="/login" />;
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  previouslyAuthenticated: !!localStorage.getItem('profile'),
});

export default connect(mapStateToProps)(LandingRoute);
