import * as R from 'ramda';
import SyncClient from "twilio-sync";

export const getSyncToken = (url, identity) => {
  return fetch(`${url}?Identity=${identity}`, {
    headers: {
      Accept: "application/json"
    },
    mode: "cors"
  })
  .then(resp => {
    console.log('getSyncToken.status', resp.status);
    return resp.json();
  })
  .then(json => {
    console.log('getSyncToken.token', json.token);
    return json;
  });
};

export const getSyncClientAndMap = R.curry((mapCallback, itemCallback, mapName, data) => {
  const options = {
    logLevel: "info"
  };
  const client = new SyncClient(data.token, options);

  client.on("connectionStateChanged", state => {
    console.log('getSyncClientAndMap.connectionState: ', {state});
  });

  client.map({id: mapName, ttl: 1800}).then(map => {
    console.log('getSyncClientAndMap: opened map:', {sid: map.sid});
    map.on("itemAdded", itemCallback);
    map.on("itemUpdated", itemCallback);
    mapCallback(map);
  });
});

export const setSyncMapItem = (map, key, data, ttl) => {
  map.set(key, data, {ttl})
  .then(function(item) {
    //console.log('setSyncMapItem successful');
  })
  .catch(function(error) {
    console.error('setSyncMapItem failed', error);
  });
};
