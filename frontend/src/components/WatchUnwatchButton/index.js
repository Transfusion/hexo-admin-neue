import React, { Component } from 'react';
import { Navbar, Nav, NavDropdown, Button, ButtonGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { setWatching } from '../../reducers/uiStateReducer';
import DataManager from '../../utils/managers/DataManager';


class WatchUnwatchButton extends Component {

  async _toggleWatch() {
    let _resp;
    if (this.props.watching) {
      _resp = await DataManager.hexoUnwatch();
    } else {
      _resp = await DataManager.hexoWatch();
    }

    if (_resp.status === 204) {
      this.props.setWatching(!this.props.watching);
    }
  }

  render() {
    const { BaseComponent } = this.props;
    if (this.props.watching === null) { return null; }
    return <BaseComponent onClick={this._toggleWatch.bind(this)}>{this.props.watching ? 'Unwatch' : 'Watch'}</BaseComponent>
  }
}


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    ...ownProps,
    setWatching: (isWatching: boolean) => {
      return dispatch(setWatching(isWatching));
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    watching: state.uiStateReducer.watching,
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(WatchUnwatchButton);