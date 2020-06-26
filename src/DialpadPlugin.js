import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import * as R from 'ramda';

import reducers, { namespace } from './states';
import registerCustomActions from './customActions';
import { loadExternalTransferInterface } from './components/ExternalTransfer';
import { loadInternalCallInterface } from './components/InternalCall';
import {getSyncToken, getSyncClientAndMap} from './helpers/sync-helpers';
const MAPNAME = 'DialingEventsMap';

const PLUGIN_NAME = 'DialpadPlugin';

const syncMapUpdated = R.curry((manager, event) => {
  const {key, data} = event.item.descriptor;
  console.log(`syncMapUpdated: key=${key}, data:`, data);
  const {callSid, status} = data;
  /*
    JLAFER here you will have access to a 'data' object with 'status' and
    'callSid' keys.
    The 'status' property is a string with one of the following values:
      initiated, ringing, in-progress, canceled, completed
    The 'callSid' value can be used to find the correct participant in the
      flex.conferences structure of the Redux state.
    With this information, the UI can be updated, state updated, etc.
    For example, in our case, we could get the current voice conference and task
    from our custom Redux store to call a function and update our UI:
    const {voiceConference, task} = manager.getState().dialpad.customConference:
    myFunction(voiceConference, task, callSid, status);
  */
});

const syncMapSet = R.curry((manager, syncMap) => {
  console.log('syncMapSet: opened map:', syncMap.sid);
  // save the Sync map in case it's needed somewhere in your code
  manager.store.dispatch({type: 'SET_SYNCMAP', payload: {syncMap}});
});

export default class DialpadPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  init(flex, manager) {
    loadExternalTransferInterface.bind(this)(flex, manager)
    loadInternalCallInterface.bind(this)(flex, manager)
    registerCustomActions(manager);

    // JLAFER here is code for setting up the Sync map, to be notified about
    //   dialing progress events when adding a participant to a conference
    // NOTE: in this sample code, no provion has been made for token refreshes 
    const { REACT_APP_SERVICE_BASE_URL } = process.env;
    const syncTokenFunctionUrl = `${REACT_APP_SERVICE_BASE_URL}/get-sync-token`;
    const worker = manager.store.getState().flex.worker.source;
    getSyncToken(syncTokenFunctionUrl, worker.sid)
    .then(tokenResponse => getSyncClientAndMap(
      syncMapSet(manager),
      syncMapUpdated(manager),
      MAPNAME,
      tokenResponse
    ));
    this.registerReducers(manager);
  }

  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }
    manager.store.addReducer(namespace, reducers);
  }
}
