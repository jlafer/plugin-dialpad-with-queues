/*
  NOTE: this reducer is for debugging purposes only.
*/
const ACTION_WORKER_UPDATE_RESERVATION = 'WORKER_UPDATE_RESERVATION';

const initialState = {};

export function reduce(state = initialState, action) {
  switch (action.type) {
    case ACTION_WORKER_UPDATE_RESERVATION: {
      console.log('plugin: WORKER_UPDATE_RESERVATION received:', action.payload)
      return state;
    }
    default:
      return state;
  }
}
