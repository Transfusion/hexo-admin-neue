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

import { refreshPages } from '../../reducers/dataReducer';
import { setEditingPage, clearEditingPage } from '../../reducers/uiStateReducer';
import { bootstrapBreakpoints } from '../../utils/ResponsiveHelpers';
import { stripFrontMatter } from '../../utils/Utils';
import { Constants } from '../../utils/Constants';
import { Config } from '../../utils/Config';

import { EditorSplitContext, MODES } from '../../utils/context/EditorSplitContextProvider';

import WritingArea from '../WritingArea';

import './styles.css';

/* no extensions and additional buttons for now */
class PageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    (async () => {
      if (!this.props.pages?.length) await this.props.refreshPages();
      // now use the query string
      const { params } = this.props.match;
      this.props.setEditingPage(params.id);
      this._reloadPageFromReducer();
    })();
  }

  componentDidUpdate(prevProps) {
    // the desktop view
    if (prevProps.editingPage !== this.props.editingPage) {
      this._reloadPageFromReducer();
    }
  }

  _reloadPageFromReducer() {
    // find the relevant page
    const page = this.props.pages.find(({ _id }) => _id === this.props.editingPage);
    if (!page) {
      this.props.clearEditingPage();
      this.props.history.push('/home/pages');
    } else {
      this.setState({ page, pageRaw: page.raw }, () => {
        // this._renderPostRaw();
      });
    }
  }

  _isNotDirty() {
    return this.state?.pageRaw === this.state?.page?.raw;
  }

  _renderEditor() {
    return <WritingArea content={this.state?.pageRaw} setContent={(content) => this.setState({ pageRaw: content })} />;
  }

  _renderPreviewPane() {
    return (
      <div
        className="px-2"
        style={{ overflow: 'scroll', width: '100%' }}
        dangerouslySetInnerHTML={{ __html: this.state?.page?.content }}
      />
    );
  }

  /* async _togglePagePublish() {
    const { _id, published } = this.state.page;
    let _resp;
    if (!published) {
      _resp = await DataManager.publishPage(_id);
    } else {
      _resp = await DataManager.unpublishPage(_id);
    }

    if (_resp.status === 200) {
      setTimeout(async () => {
        // refresh
        await this.props.refreshPage();
        this._reloadPageFromReducer();
      }, 500);
    }
  } */

  async _deletePage() {
    const { _id } = this.state.page;
    const _resp = await DataManager.deletePage(_id);
    if (_resp.status === 204) { // successful, nothing to respond
      await this.props.refreshPages();
      this.props.clearEditingPage();
      this.props.history.push('/home/pages');
    }
  }

  async _savePage() {
    const { toastManager } = this.props;
    const _resp = await DataManager.savePage(this.props.editingPage, /* stripFrontMatter */(this.state.pageRaw));
    if (_resp.status === 200) {
      // _content of the new page will be missing if we refresh too fast...
      setTimeout(async () => {
        await this.props.refreshPages();
        // this.setState({ dirty: false });
        this._reloadPageFromReducer();
        toast('Page successfully saved.');
      }, 500);
    }
  }

  _renderLayout() {
    const editor = this._renderEditor();
    return (
      <>
        <div className="page-editor-toolbar p-2">
          <MediaQuery minWidth={bootstrapBreakpoints.md}>
            {(matches) => (!matches ? (
              <div style={{ display: 'inline-block', padding: '10px' }}>
                <Link
                  onClick={() => { this.props.clearEditingPage(); }}
                  to={{
                    pathname: '/home/pages',
                    // state: { previousPage: this.state?.page?._id }
                    state: { previousPage: this.state?.page?._id },
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
            <Button size="sm" disabled={this._isNotDirty()} variant="info" onClick={this._savePage.bind(this)} style={{ display: 'inline-block' }}>Save</Button>
          </div>

          {this.state.page && <div className="px-1"><Button size="sm" variant="danger" onClick={this._deletePage.bind(this)} style={{ display: 'inline-block' }}>Delete</Button></div>}

          {/* no publish/unpublish button */}


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
    return !this.props.editingPage
      ? <div className="no-selected-page-text"><h4>Select a page.</h4></div>
      : (
        <div className="overflow-auto" style={{ maxHeight: `calc(100vh - ${Constants.navbarHeight}`, width: '100%' }}>
          {this._renderLayout()}
        </div>
      );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...ownProps,
  setEditingPage: (_id) => { dispatch(setEditingPage(_id)); },
  clearEditingPage: () => { dispatch(clearEditingPage()); },
  refreshPages: () => dispatch(refreshPages()),
});


const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  refreshing: state.dataReducer.refreshing,
  pages: state.dataReducer.pages,
  editingPage: state.uiStateReducer.editingPage,
});

PageEditor.propTypes = {
  editingPage: PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PageEditor));
