import { combineReducers } from 'redux';
import { drawerReducer } from './drawerReducer';
import { authReducer } from './authReducer';

import { dataReducer } from './dataReducer';

import { uiStateReducer } from './uiStateReducer';

export default combineReducers({
  drawerReducer,
  authReducer,
  dataReducer,
  uiStateReducer,
});
