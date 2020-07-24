import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import SplitPane from '@transfusion/react-split-pane';
import { toast } from 'react-toastify';

import MediaQuery, { useMediaQuery } from 'react-responsive';

import { Button, ButtonGroup } from 'react-bootstrap';

import SplitModeButtonGroup from '../SplitModeButtonGroup';
import DataManager from '../../utils/managers/DataManager';

import { refreshPosts } from '../../reducers/dataReducer';
import { setEditingPost, clearEditingPost } from '../../reducers/uiStateReducer';
import { bootstrapBreakpoints } from '../../utils/ResponsiveHelpers';
import { stripFrontMatter } from '../../utils/Utils';
import { Constants } from '../../utils/Constants';
import { Config } from '../../utils/Config';

import { EditorSplitContext, MODES } from '../../utils/context/EditorSplitContextProvider';

import WritingArea from '../WritingArea';

import './styles.css';

/* no extensions and additional buttons for now */
class PostEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // copy the post into the state
  componentWillMount() {
    /* if (!!this.props.editingPost) {
      this._reloadPostFromReducer();
      return;
    } */
    // if editingPost is null, that means we must have navigated here directly.

    /* let isMdOrSmaller = window.matchMedia(`(max-width: ${bootstrapBreakpoints.md}px)`);
    // if isMdOrSmaller is true, then don't proceed
    isMdOrSmaller = isMdOrSmaller.matches;
    if (!isMdOrSmaller) {
      return;
    } */

    (async () => {
      if (!this.props.posts?.length) await this.props.refreshPosts();
      // now use the query string
      const { params } = this.props.match;
      this.props.setEditingPost(params.id);
      this._reloadPostFromReducer();
    })();
  }

  componentDidUpdate(prevProps) {
    // the desktop view
    if (prevProps.editingPost !== this.props.editingPost) {
      this._reloadPostFromReducer();
    }
  }

  _reloadPostFromReducer() {
    // find the relevant post
    const post = this.props.posts.find(({ _id }) => _id === this.props.editingPost);
    if (!post) {
      this.props.clearEditingPost();
      this.props.history.push('/home/posts');
    } else {
      this.setState({ post, postRaw: post.raw }, () => {
        // this._renderPostRaw();
      });
    }
  }

  _isNotDirty() {
    return this.state?.postRaw === this.state?.post?.raw;
  }

  _renderEditor() {
    // return <>
    //   <MarkdownInput
    //     onChange={value => {
    //       // upon first edit
    //       /* if (!this.postRaw) {
    //         this.setState({ dirty: true});
    //       }
    //       this.postRaw = value; */
    //       this.setState({ postRaw: value, dirty: true });
    //     }}
    //     onBlur={() => { }}
    //     value={this.state?.post?.raw}
    //     autoFocus={false}
    //     readOnly={false}
    //     showFullScreenButton={true}
    //     hideToolbar={false}
    //     locale='en' />
    // </>

    // return <CodeMirror
    //   value={this.state?.post?.raw}
    //   options={{
    //     lineWrapping: true, theme: 'material',
    //     lineNumbers: true
    //   }}
    //   onChange={(editor, data, value) => {
    //     this.setState({ postRaw: value });
    //   }}
    //   editorDidMount={e => e.setSize(null, "auto")}
    // />

    // return <AceEditor
    //   mode="plain_text"
    //   value={this.state?.postRaw}
    //   theme="monokai"
    //   onChange={(value, evt) => { this.setState({ postRaw: value }) }}
    //   name="writing-area"
    //   editorProps={{ $blockScrolling: true }}
    // />

    return <WritingArea content={this.state?.postRaw} setContent={(content) => this.setState({ postRaw: content })} />;
  }

  _renderPreviewPane() {
    /* if (!!this.state.renderedHTML) {
      return <div className="px-2" style={{ overflow: 'scroll', width: '100%' }}
        // dangerouslySetInnerHTML={{ __html: this.state.renderedHTML }}
        dangerouslySetInnerHTML={{ __html: this.state?.post?.content }}
      />;
    } else {
      return <div>Preview Pane</div>;
    } */
    return (
      <div
        className="px-2"
        style={{ overflow: 'scroll', width: '100%' }}
        // dangerouslySetInnerHTML={{ __html: this.state.renderedHTML }}
        dangerouslySetInnerHTML={{ __html: this.state?.post?.content }}
      />
    );
  }


  /* async _renderPostRaw() {
    if (!this.state.postRaw) { return; }

    const _nonFrontMatter = stripFrontMatter(this.state.postRaw);

    const _renderedHTML = await DataManager.getRendered(_nonFrontMatter);
    if (_renderedHTML.status === 200) {
      this.setState({ renderedHTML: _renderedHTML.data });
    }
  } */

  /**
   * The button whose onClick calls this function is conditionally rendered only if !!this.state.post
   */
  async _togglePostPublish() {
    const { _id, published } = this.state.post;
    let _resp;
    if (!published) {
      _resp = await DataManager.publishPost(_id);
    } else {
      _resp = await DataManager.unpublishPost(_id);
    }

    if (_resp.status === 200) {
      setTimeout(async () => {
        // refresh
        await this.props.refreshPosts();
        this._reloadPostFromReducer();
      }, 500);
    }
  }

  async _deletePost() {
    const { _id, published } = this.state.post;
    if (published) {
      toast('Cannot delete a published post.');
    } else {
      const _resp = await DataManager.deletePost(_id);
      if (_resp.status === 200) {
        await this.props.refreshPosts();
        this.props.clearEditingPost();
        this.props.history.push('/home/posts');
      }
    }
  }

  async _savePost() {
    const { toastManager } = this.props;
    const _resp = await DataManager.savePost(this.props.editingPost, /* stripFrontMatter */(this.state.postRaw));
    if (_resp.status === 200) {
      // _content of the new post will be missing if we refresh too fast...
      setTimeout(async () => {
        await this.props.refreshPosts();
        // this.setState({ dirty: false });
        this._reloadPostFromReducer();
        toast('Post successfully saved.');
      }, 500);
    }
  }

  _renderLayout() {
    const editor = this._renderEditor();
    return (
      <>
        <div className="post-editor-toolbar p-2">
          <MediaQuery minWidth={bootstrapBreakpoints.md}>
            {(matches) => (!matches ? (
              <div style={{ display: 'inline-block', padding: '10px' }}>
                <Link
                  onClick={() => { this.props.clearEditingPost(); }}
                  to={{
                    pathname: '/home/posts',
                    // state: { previousPost: this.state?.post?._id }
                    state: { previousPost: this.state?.post?._id },
                  }}
                >
                  {'< Back'}
                </Link>
              </div>
            ) : <div />)}
          </MediaQuery>

          <SplitModeButtonGroup />

          <div style={{ flexGrow: 1 }} />

          <div className="px-1">
            <Button size="sm" disabled={this._isNotDirty()} variant="info" onClick={this._savePost.bind(this)} style={{ display: 'inline-block' }}>Save</Button>
          </div>

          {this.state.post && <div className="px-1"><Button size="sm" disabled={this.state?.post.published} variant="danger" onClick={this._deletePost.bind(this)} style={{ display: 'inline-block' }}>Delete</Button></div>}

          {this.state.post && (
            <div className="px-1">
              <Button size="sm" variant="secondary" onClick={this._togglePostPublish.bind(this)} style={{ display: 'inline-block' }}>
                {this.state.post.published ? 'Unp' : 'P'}
              ublish
            </Button>
            </div>
          )}

          {/* <div className="px-1">
          <Button size="sm" variant="success" onClick={this._renderPostRaw.bind(this)} style={{ display: 'inline-block' }}>Render</Button>
        </div> */}

        </div>

        <EditorSplitContext.Consumer>
          {(context) => (
            <SplitPane primary="second" style={{ position: 'relative', height: 'calc((100vh - var(--navbar-height)) - var(--editor-toolbar-height))' }} split={context.mode === MODES.VERTICAL ? 'vertical' : 'horizontal'} minSize={100} maxSize={-100} defaultSize={350}>
              {this._renderPreviewPane()}
              {editor}
            </SplitPane>
          )}
        </EditorSplitContext.Consumer>

      </>
    );
  }

  render() {
    return !this.props.editingPost
      ? <div className="no-selected-post-text"><h4>Select a post.</h4></div>
      : (
        <div className="overflow-auto" style={{ maxHeight: `calc(100vh - ${Constants.navbarHeight}`, width: '100%' }}>
          {this._renderLayout()}
        </div>
      );
  }
}


const mapDispatchToProps = (dispatch, ownProps) => ({
  ...ownProps,
  setEditingPost: (_id) => { dispatch(setEditingPost(_id)); },
  clearEditingPost: () => { dispatch(clearEditingPost()); },
  refreshPosts: () => dispatch(refreshPosts()),
});

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  refreshing: state.dataReducer.refreshing,
  posts: state.dataReducer.posts,
  editingPost: state.uiStateReducer.editingPost,
});

PostEditor.propTypes = {
  editingPost: PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PostEditor));
