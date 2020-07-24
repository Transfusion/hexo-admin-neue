import React, { Component } from 'react';

import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import MasterDetail from '../../utils/MasterDetail';
import PostList from '../../components/PostsList';
import PostEditor from '../../components/PostEditor';
import { EditorSplitContextProvider } from '../../utils/context/EditorSplitContextProvider';

import { refreshPosts } from '../../reducers/dataReducer';

// import { SearchInContextProvider } from '../../utils/context/SearchInContextProvider';

class PostsScreen extends Component {
  componentDidMount() {
    /* if we directly navigated here instead of a particular post
    i.e. we aren't navigating to the /detail/:id route */
    (async () => {
      const { params } = this.props.match;
      if (!params.id) {
        await this.props.refreshPosts();
      }
    })();
  }

  render() {
    return (
      <>
        <EditorSplitContextProvider>
          {/* <SearchInContextProvider> */}
          <MasterDetail master={<PostList />} detail={<PostEditor />} />
          {/* </SearchInContextProvider> */}
        </EditorSplitContextProvider>
      </>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...ownProps,
  refreshPosts: () => dispatch(refreshPosts()),
});

export default connect(null, mapDispatchToProps)(withRouter(PostsScreen));
