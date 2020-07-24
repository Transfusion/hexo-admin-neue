import React, { Component } from 'react';

import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import MasterDetail from '../../utils/MasterDetail';
import PagesList from '../../components/PagesList';
import PageEditor from '../../components/PageEditor';
import { EditorSplitContextProvider } from '../../utils/context/EditorSplitContextProvider';
// import { SearchInContextProvider } from '../../utils/context/SearchInContextProvider';

import { refreshPages } from '../../reducers/dataReducer';

class PagesScreen extends Component {
  componentDidMount() {
    /* if we directly navigated here instead of a particular post
    i.e. we aren't navigating to the /detail/:id route */
    (async () => {
      const { params } = this.props.match;
      if (!params.id) {
        await this.props.refreshPages();
      }
    })();
  }

  render() {
    return (
      <>
        <EditorSplitContextProvider>
          {/* <SearchInContextProvider> */}
          <MasterDetail master={<PagesList />} detail={<PageEditor />} />
          {/* </SearchInContextProvider> */}
        </EditorSplitContextProvider>
      </>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...ownProps,
  refreshPages: () => dispatch(refreshPages()),
});

export default connect(null, mapDispatchToProps)(withRouter(PagesScreen));
