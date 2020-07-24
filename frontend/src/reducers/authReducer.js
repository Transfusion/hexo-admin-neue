export const AUTH_ACTIONS = {
  LOAD_PROFILE: 'LOAD_PROFILE',
  LOGOUT: 'LOGOUT',
};

export const loadProfileInfo = (profileInfo) => ({ type: AUTH_ACTIONS.LOAD_PROFILE, profileInfo });

const initialState = {
  profileInfo: null, // we are using cookie authentication here
};

/* export const login = (username, password) => {
    return async (dispatch, getState) => {
        let loginResult = await performLogin(username, userId, password);
        // short-circuiting
        if (!!loginResult && loginResult.ResponseCode === ResponseCodes.success) {
            dispatch(checkLoggedIn());
        }
        return loginResult;
    }
} */

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOAD_PROFILE:
      return { ...state, profileInfo: action.profileInfo };
    default:
      return state;
  }
};
