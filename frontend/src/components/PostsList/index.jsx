import React, { Component } from 'react';
import { withRouter } from 'react-router';
import {
  Form, FormControl, InputGroup, Button,
} from 'react-bootstrap';

import Spinner from 'react-bootstrap/Spinner';

import { connect } from 'react-redux';
import { refreshPosts } from '../../reducers/dataReducer';
import { Constants } from '../../utils/Constants';

import './styles.css';
import PostPreview from '../PostPreview';
import DataManager from '../../utils/managers/DataManager';
import { SearchInContext, PostsSortMode } from '../../utils/context/SearchInContextProvider';

// https://stackoverflow.com/questions/41574776/what-is-class-mb-0-in-bootstrap-4
class PostList extends Component {
  constructor(props) {
    super(props);
    this.postRefs = {};
    this.state = {
      toolbarAccordionExpanded: false,
    };
  }

  componentDidMount() {
    const { state } = this.props.location;

    if (state?.previousPost) {
      /* if navigated back from the PostEditor (which only happens on mobile), scroll
      to the appropriate post */
      const postPreviewRef = this.postRefs[state.previousPost];
      // https://stackoverflow.com/questions/51693111/current-is-always-null-when-using-react-createref
      if (postPreviewRef?.current) {
        postPreviewRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }

  getFilteredPostsList() {
    if (!this.props.posts) return [];
    // read from the react context in here : )
    // TODO: can probably combine some of these rules..
    let sortFunc;
    switch (this.context.postsSortMode) {
      case PostsSortMode.UPDATED_DESCENDING.code:
        sortFunc = (a, b) => new Date(b.updated) - new Date(a.updated);
        break;
      case PostsSortMode.UPDATED_ASCENDING.code:
        sortFunc = (a, b) => new Date(a.updated) - new Date(b.updated);
        break;
      case PostsSortMode.CREATED_DESCENDING.code:
        sortFunc = (a, b) => new Date(b.date) - new Date(a.date);
        break;
      // case PostsSortMode.CREATED_ASCENDING.code:
      default:
        sortFunc = (a, b) => new Date(a.date) - new Date(b.date);
        break;
    }
    const posts = this.props.posts.sort(sortFunc).filter(({ isDiscarded }) => !isDiscarded);

    const { searchText } = this.state;
    if (!searchText) return posts;

    return posts.filter(({ title, _content }) => (title.includes(searchText)
    && this.context.inTitle) || (_content.includes(searchText) && this.context.inBody));
  }

  createPostButtonPressed = async () => {
    const name = prompt('Post Name:', 'New Post');
    if (!name) { return; }
    // add and reload posts
    const resp = await DataManager.createPost(name);
    this.props.refreshPosts();
  }

  renderPostPreviews() {
    if (!this.props.posts) {
      return null;
    }
    // https://www.robinwieruch.de/react-scroll-to-item
    const filteredPostsList = this.getFilteredPostsList();
    this.postRefs = filteredPostsList.reduce((acc, post) => {
      // eslint-disable-next-line no-underscore-dangle
      acc[post._id] = React.createRef();
      return acc;
    }, {});

    // map
    return (
      <div className="posts-list-margin-wrapper overflow-auto">
        {filteredPostsList.map((post) => <PostPreview post={post} ref={this.postRefs[post._id]} />)}
      </div>
    );
  }


  render() {
    // passed in from PostsScreen.js

    return (
      <div style={{ maxHeight: 'calc(100vh - var(--navbar-height))', width: '100%' }}>

        <SearchInContext.Consumer>
          {(context) => (
            <>
              {/* absolutely positioned */}
              <div className="posts-list-toolbar">

                <div className="pl-3">
                  <Button onClick={() => { this.props.refreshPosts(); }} variant="outline-success"><i className="fas fa-sync" /></Button>
                </div>

                <InputGroup className="p-3">
                  <FormControl
                    onChange={({ target }) => { this.setState({ _searchText: target.value }); }}
                    placeholder="Search..."
                    aria-label="Search..."
                  />
                  <InputGroup.Append>
                    <Button onClick={() => { this.setState({ searchText: this.state._searchText }); }} variant="outline-primary">Search</Button>
                  </InputGroup.Append>
                </InputGroup>

                {/* add post button */}
                <div>
                  <Button onClick={this.createPostButtonPressed} variant="outline-primary"><i className="fa fa-plus" /></Button>
                </div>

                <div className="px-3" onClick={() => { this.setState({ toolbarAccordionExpanded: !this.state.toolbarAccordionExpanded }); }}>
                  <i className={`fa fa-chevron-${this.state.toolbarAccordionExpanded ? 'up' : 'down'}`} />
                </div>
              </div>


              {this.state.toolbarAccordionExpanded && (
              <div className="posts-list-toolbar-accordion">
                <div className="pb-3 px-3 border-bottom">
                  <div style={{ fontWeight: 'bold' }}>
                    Search in...
                  </div>
                  <div>
                    <input
                      onChange={({ target }) => {
                        context.setInTitle(target.checked);
                      }}
                      checked={context.inTitle}
                      type="checkbox"
                      id="checkbox-title"
                      name="checkbox-title"
                    />
                    <label className="pl-2" htmlFor="checkbox-title">Title</label>
                  </div>

                  <div>
                    <input
                      onChange={({ target }) => {
                        context.setInBody(target.checked);
                      }}
                      checked={context.inBody}
                      type="checkbox"
                      id="checkbox-body"
                      name="checkbox-body"
                    />
                    <label className="pl-2" htmlFor="checkbox-body">Body</label>
                  </div>

                  <div style={{ fontWeight: 'bold' }}>
                    Sort by...
                  </div>

                  <div onChange={({ target }) => {
                    context.setSortMode(target.value);
                  }}
                  >
                    {Object.values(PostsSortMode).map(({ name, code }) => (
                      <div>
                        <input checked={context.postsSortMode === code} type="radio" value={code} name="sort-mode" />
                        {' '}
                        {name}
                      </div>
                    ))}
                  </div>


                </div>
              </div>
              )}
            </>
          )}
        </SearchInContext.Consumer>


        {/* vertical spacer */}
        <div style={{ height: 'var(--post-page-toolbar-height)' }} />

        {!this.props.refreshing && !this.props.posts?.length > 0 ? (
          <div className="no-posts-text">
            No posts.
            <Button onClick={this.props.refreshPosts.bind(this)} variant="link">Reload</Button>
          </div>
        ) : null}

        {this.props.refreshing ? (
          <div style={{
            position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', left: 0, right: 0,
          }}
          >
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        ) : null}

        {this.renderPostPreviews()}

      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...ownProps,
  refreshPosts: () => dispatch(refreshPosts()),
});

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  refreshing: state.dataReducer.refreshing,
  posts: state.dataReducer.posts,
});

// https://stackoverflow.com/questions/49809884/access-react-context-outside-of-render-function
PostList.contextType = SearchInContext;
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PostList));
