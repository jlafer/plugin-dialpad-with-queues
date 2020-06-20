/*
  NOTE: this reducer demonstrates how to capture the current voice ITask object
  in state and then use a subsequent 'CONFERENCE_MULTIPLE_UPDATE' action to
  capture the conference sid from that task. These are then available when code
  is executed to add a participant or otherwise manipulate the voice conference.
*/
const ACTION_CONFERENCE_MULTIPLE_UPDATE = 'CONFERENCE_MULTIPLE_UPDATE';

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
      //const {conferences} = action.payload;
      //console.log('plugin: CONFERENCE_MULTIPLE_UPDATE received conferences:', conferences);
      if (state.task) {
        //console.log('plugin: CONFERENCE_MULTIPLE_UPDATE task.conference in state:', state.task.conference);
        return {...state, voiceConference: state.task.conference};
      }
      return state;
    }
    default:
      return state;
  }
}
