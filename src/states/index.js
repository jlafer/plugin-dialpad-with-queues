import { combineReducers } from 'redux';

import { reduce as CustomConferenceReducer } from './CustomConferenceState';

// Register your redux store under a unique namespace
export const namespace = 'dialpad';

// Combine the reducers
export default combineReducers({
  customConference: CustomConferenceReducer
});
