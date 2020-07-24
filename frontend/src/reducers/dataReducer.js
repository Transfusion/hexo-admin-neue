/* eslint-disable no-unused-vars */
import DataManager from '../utils/managers/DataManager';

export const DATA_ACTIONS = {
  START_REFRESHING: 'START_REFRESHING',
  STOP_REFRESHING: 'STOP_REFRESHING',

  LOAD_POSTS: 'LOAD_POSTS',
  LOAD_PAGES: 'LOAD_PAGES',
};

/* export const loadPosts = (posts) => {
  return { type: DATA_ACTIONS.LOAD_POSTS, posts };
} */

const initialState = {
  refreshing: false,
  posts: null,
  pages: null,
};

export const refreshPosts = () => async (dispatch, getState) => {
  dispatch({ type: DATA_ACTIONS.START_REFRESHING });
  const posts = await DataManager.getAllPosts();
  dispatch({ type: DATA_ACTIONS.LOAD_POSTS, posts: posts.data });
  dispatch({ type: DATA_ACTIONS.STOP_REFRESHING });
};

export const refreshPages = () => async (dispatch, getState) => {
  dispatch({ type: DATA_ACTIONS.START_REFRESHING });
  const pages = await DataManager.getAllPages();
  dispatch({ type: DATA_ACTIONS.LOAD_PAGES, pages: pages.data });
  dispatch({ type: DATA_ACTIONS.STOP_REFRESHING });
};

export const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case DATA_ACTIONS.LOAD_POSTS:
      return { ...state, posts: action.posts };
    case DATA_ACTIONS.LOAD_PAGES:
      return { ...state, pages: action.pages };
    case DATA_ACTIONS.START_REFRESHING:
      return { ...state, refreshing: true };
    case DATA_ACTIONS.STOP_REFRESHING:
      return { ...state, refreshing: false };
    default:
      return state;
  }
};
