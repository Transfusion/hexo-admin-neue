/* eslint-disable no-underscore-dangle */
export const UISTATE_ACTIONS = {
  SET_EDITING_POST: 'SET_EDITING_POST',
  CLEAR_EDITING_POST: 'CLEAR_EDITING_POST',
  SET_EDITING_PAGE: 'SET_EDITING_PAGE',
  CLEAR_EDITING_PAGE: 'CLEAR_EDITING_PAGE',

  SET_WATCHING: 'SET_WATCHING',
};

export const setEditingPost = (_id) => ({ type: UISTATE_ACTIONS.SET_EDITING_POST, _id });

export const clearEditingPost = () => ({ type: UISTATE_ACTIONS.CLEAR_EDITING_POST });

export const setEditingPage = (_id) => ({ type: UISTATE_ACTIONS.SET_EDITING_PAGE, _id });

export const clearEditingPage = () => ({ type: UISTATE_ACTIONS.CLEAR_EDITING_PAGE });

export const setWatching = (isWatching: boolean) => ({
  type: UISTATE_ACTIONS.SET_WATCHING, isWatching,
});

const initialState = {
  editingPost: null, // the _id of the post being edited
  watching: null, // has to be watching in order to be usable
};

export const uiStateReducer = (state = initialState, action) => {
  switch (action.type) {
    case UISTATE_ACTIONS.SET_EDITING_POST:
      return { ...state, editingPost: action._id };
    case UISTATE_ACTIONS.SET_EDITING_PAGE:
      return { ...state, editingPage: action._id };
    case UISTATE_ACTIONS.CLEAR_EDITING_POST:
      return { ...state, editingPost: null };
    case UISTATE_ACTIONS.CLEAR_EDITING_PAGE:
      return { ...state, editingPage: null };
    case UISTATE_ACTIONS.SET_WATCHING:
      return { ...state, watching: action.isWatching };
    default:
      return state;
  }
};
