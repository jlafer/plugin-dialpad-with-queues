import * as R from 'ramda';
import {diff} from 'deep-object-diff';

/*
  NOTE: this reducer demonstrates how to capture the current voice ITask object
  in state and then use a subsequent 'CONFERENCE_MULTIPLE_UPDATE' action to
  capture the conference sid from that task. These are then available when code
  is executed to add a participant or otherwise manipulate the voice conference.
*/
const ACTION_CONFERENCE_MULTIPLE_UPDATE = 'CONFERENCE_MULTIPLE_UPDATE';

const getVoiceConference = (conferences) => {
  if (Array.isArray(conferences))
    if (conferences.length === 0)
      return {};
    else
      return conferences[0];
  if (conferences.size === 0)
    return {};
  for (let [_key, value] of conferences.entries()) {
    return value;
  }  
}

const initialState = {
  task: null,
  voiceConference: null
};

export function reduce(state = initialState, action) {
  switch (action.type) {
    case 'SET_TASK':
      const {task} = action.payload;
      if (task && task.taskChannelUniqueName === 'voice')
        return {...state, task};
      return state;
    case ACTION_CONFERENCE_MULTIPLE_UPDATE: {
      const newConference = getVoiceConference(
        action.payload.conferences
      );
      // JLAFER for debug purposes only, diff the changes to flex.conferences
      const confnceDiff = diff(state.conference, newConference);
      console.log('CONFERENCE_DIFF:', confnceDiff);
      const voiceConference = (state.task) ? state.task.conference : state.voiceConference;
      return {...state, voiceConference};
    }
    default:
      return state;
  }
}
