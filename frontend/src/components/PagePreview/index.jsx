import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import clip from 'text-clipper';
import { FormControl, InputGroup, Button } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Config } from '../../utils/Config';

import PropValidation from '../../utils/PropValidation';

import { setEditingPage } from '../../reducers/uiStateReducer';
import history from '../../utils/history';

import './styles.css';

class PagePreview extends Component {
  onClick() {
    const { _id } = this.props.page;
    this.props.setEditingPage(_id);
    history.push(`/home/pages/detail/${_id}`); // does not refresh the page!
  }

  render() {
    const { forwardedRef } = this.props;
    const {
      _id, title, author, date, updated, excerpt, content, published, isDraft,
    } = this.props.page;
    const textToExcerpt = clip(excerpt || content, 150, { html: true });

    return (
      <div
        ref={forwardedRef}
        key={_id}
        onClick={this.onClick.bind(this)}
        className="page-preview border-bottom p-2"
        style={{ backgroundColor: this.props.editingPage === _id ? 'gainsboro' : null }}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {isDraft && <small className="text-danger">DRAFT</small>}
        </div>
        <div className="font-weight-bold">{title}</div>
        <div>
          <small>
            Created:
            {moment(date).format('lll')}
          </small>
        </div>
        <div>
          <small>
            Updated:
            {moment(updated).format('lll')}
          </small>
        </div>

        <div className="page-preview-html">
          { /* eslint-disable-next-line react/no-danger */ }
          <small dangerouslySetInnerHTML={{ __html: textToExcerpt }} />
        </div>
      </div>
    );
  }
}

PagePreview.propTypes = {
  page: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    author: PropTypes.string,
    excerpt: PropTypes.string,
    content: PropTypes.string,
    published: PropTypes.bool,

    date: PropValidation.isISO8601,
    updated: PropValidation.isISO8601,
  }).isRequired,
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...ownProps,
  setEditingPage: (_id) => { dispatch(setEditingPage(_id)); },
});

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  editingPage: state.uiStateReducer.editingPage,
});


export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(
  React.forwardRef((props, ref) => <PagePreview {...props} forwardedRef={ref} />),
);
