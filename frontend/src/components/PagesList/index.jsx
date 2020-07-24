import React, { Component } from 'react';
import { FormControl, InputGroup, Button } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import PagePreview from '../PagePreview';
import { refreshPages } from '../../reducers/dataReducer';
import DataManager from '../../utils/managers/DataManager';
import { SearchInContext, PostsSortMode } from '../../utils/context/SearchInContextProvider';

import './styles.css';

class PagesList extends Component {
  constructor(props) {
    super(props);
    this.pageRefs = {};
    this.state = {
      toolbarAccordionExpanded: false,
    };
  }

  componentDidMount() {
    const { state } = this.props.location;

    if (state?.previousPage) {
      /* if navigated back from the PageEditor (which only happens on mobile),
      scroll to the appropriate page */
      const pagePreviewRef = this.pageRefs[state.previousPage];
      // https://stackoverflow.com/questions/51693111/current-is-always-null-when-using-react-createref
      if (pagePreviewRef?.current) {
        pagePreviewRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }


  getFilteredPagesList() {
    if (!this.props.pages) return [];

    // the need may arise to require page-specific sorting logic

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
      case PostsSortMode.CREATED_ASCENDING.code:
        sortFunc = (a, b) => new Date(a.date) - new Date(b.date);
        break;
      default:
        break;
    }
    const pages = this.props.pages.sort(sortFunc).filter(({ isDiscarded }) => !isDiscarded);

    const { searchText } = this.state;
    if (!searchText) return pages;

    return pages.filter(({ title, _content }) => (title.includes(searchText)
    && this.context.inTitle) || (_content.includes(searchText) && this.context.inBody));
  }

  createPageButtonPressed = async () => {
    const name = prompt('Page Name:', 'New Page');
    if (!name) { return; }

    // add and reload pages
    await DataManager.createPage(name);
    this.props.refreshPages();
  }

  renderPagePreviews() {
    if (!this.props.pages) {
      return null;
    }
    // https://www.robinwieruch.de/react-scroll-to-item
    const filteredPagesList = this.getFilteredPagesList();
    this.pageRefs = filteredPagesList.reduce((acc, page) => {
      // eslint-disable-next-line no-underscore-dangle
      acc[page._id] = React.createRef();
      return acc;
    }, {});


    return (
      <div className="pages-list-margin-wrapper overflow-auto">
        {filteredPagesList.map((page) => <PagePreview page={page} ref={this.pageRefs[page._id]} />)}
      </div>
    );
  }

  render() {
    // passed in from PagesScreen.js
    return (
      <div style={{ maxHeight: 'calc(100vh - var(--navbar-height))', width: '100%' }}>

        <SearchInContext.Consumer>
          {(context) => (
            <>
              {/* absolutely positioned */}
              <div className="pages-list-toolbar">

                <div className="pl-3">
                  <Button onClick={() => { this.props.refreshPages(); }} variant="outline-success"><i className="fas fa-sync" /></Button>
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

                {/* add page button */}
                <div>
                  <Button onClick={this.createPageButtonPressed} variant="outline-primary"><i className="fa fa-plus" /></Button>
                </div>

                <div className="px-3" onClick={() => { this.setState({ toolbarAccordionExpanded: !this.state.toolbarAccordionExpanded }); }}>
                  <i className={`fa fa-chevron-${this.state.toolbarAccordionExpanded ? 'up' : 'down'}`} />
                </div>
              </div>


              {this.state.toolbarAccordionExpanded && (
              <div className="pages-list-toolbar-accordion">
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

        {!this.props.refreshing && !this.props.pages?.length > 0 ? (
          <div className="no-pages-text">
            No pages.
            <Button onClick={this.props.refreshPages.bind(this)} variant="link">Reload</Button>
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

        {this.renderPagePreviews()}

      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...ownProps,
  refreshPages: () => dispatch(refreshPages()),
});

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  refreshing: state.dataReducer.refreshing,
  pages: state.dataReducer.pages,
});

PagesList.contextType = SearchInContext;
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PagesList));
