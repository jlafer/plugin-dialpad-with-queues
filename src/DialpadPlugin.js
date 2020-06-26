import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import * as R from 'ramda';

import reducers, { namespace } from './states';
import registerCustomActions from './customActions';
import { loadExternalTransferInterface } from './components/ExternalTransfer';
import { loadInternalCallInterface } from './components/InternalCall';
// JLAFER
import {getSyncToken, getSyncClientAndMap} from './helpers/sync-helpers';

const PLUGIN_NAME = 'DialpadPlugin';

const syncMapUpdated = R.curry((manager, event) => {
  const {key, data} = event.item.descriptor;
  console.log(`syncMapUpdated: key=${key}, data:`, data);
});

const syncMapSet = R.curry((manager, syncMap) => {
  console.log('syncMapSet: opened map:', syncMap.sid);
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
    const { REACT_APP_SERVICE_BASE_URL } = process.env;
    const syncTokenFunctionUrl = `${REACT_APP_SERVICE_BASE_URL}/get-sync-token`;
    //console.log('init: syncTokenFunctionUrl:', syncTokenFunctionUrl);
    const worker = manager.store.getState().flex.worker.source;
    getSyncToken(syncTokenFunctionUrl, worker.sid)
    .then(tokenResponse => getSyncClientAndMap(
      syncMapSet(manager),
      syncMapUpdated(manager),
      'callAnsweredMap',
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
