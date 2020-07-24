import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import clip from 'text-clipper';

import './styles.css';
import { connect } from 'react-redux';

import PropValidation from '../../utils/PropValidation';
import { setEditingPost } from '../../reducers/uiStateReducer';
import history from '../../utils/history';

class PostPreview extends Component {
  onClick = () => {
    const { post } = this.props;
    const { _id } = post;
    // eslint-disable-next-line react/destructuring-assignment
    this.props.setEditingPost(_id);
    history.push(`/home/posts/detail/${_id}`); // does not refresh the page!
  }

  render() {
    const { post, editingPost, forwardedRef } = this.props;
    const {
      // eslint-disable-next-line no-unused-vars
      _id, title, date, updated, excerpt, content, published,
    } = post;
    const textToExcerpt = clip(excerpt || content, 150, { html: true });

    return (
      <div
        role="button"
        ref={forwardedRef}
        key={_id}
        onClick={this.onClick}
        className="post-preview border-bottom p-2"
        style={{ backgroundColor: editingPost === _id ? 'gainsboro' : null }}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {!published && <small className="text-danger">DRAFT</small>}
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

        <div className="post-preview-html">
          <small dangerouslySetInnerHTML={{ __html: textToExcerpt }} />
        </div>
      </div>
    );
  }
}

PostPreview.propTypes = {
  setEditingPost: PropTypes.func.isRequired,
  editingPost: PropTypes.string,
  post: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    author: PropTypes.string,
    excerpt: PropTypes.string,
    content: PropTypes.string,
    published: PropTypes.bool,

    date: PropValidation.isISO8601,
    updated: PropValidation.isISO8601,
  }).isRequired,
  forwardedRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
};

PostPreview.defaultProps = {
  editingPost: null,
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...ownProps,
  setEditingPost: (_id) => { dispatch(setEditingPost(_id)); },
});

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  editingPost: state.uiStateReducer.editingPost,
});


export default connect(mapStateToProps,
  mapDispatchToProps,
  null, { forwardRef: true })(React.forwardRef(
  // eslint-disable-next-line react/jsx-props-no-spreading
  (props, ref) => <PostPreview {...props} forwardedRef={ref} />,
));
