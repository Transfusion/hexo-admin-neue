export const DRAWER_ACTION = {
  SHOW_NAV_DRAWER: 'SHOW_NAV_DRAWER',
};

/** actions begin here * */
export const showNavDrawer = (isShown) => ({
  type: DRAWER_ACTION.SHOW_NAV_DRAWER,
  payload: isShown,
});

/** actions end here * */

const initialState = {
  navDrawerIsOpen: true,
};


export const drawerReducer = (state = initialState, action) => {
  switch (action.type) {
    case DRAWER_ACTION.SHOW_NAV_DRAWER:
      return {
        ...state,
        navDrawerIsOpen: action.payload,
      };
    default:
      return state;
  }
};
