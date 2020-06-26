/*
  This is the call status callback for conferences[CFxxx].participants.create.
  It updates keys in a syncmap that communicates events to the Flex client.
Event:
    CallSid - the sid of the call being added to the conference
*/

const MAPNAME = 'DialingEventsMap';

exports.handler = async (context, event, callback) => {
  const { CallSid, CallStatus} = event;
  console.log(`conference-call-status-callback: received event:`, event);
  const client = context.getTwilioClient();
  const response = new Twilio.Response();
  client.sync.services(process.env.TWILIO_SYNC_SERVICE)
    .syncMaps(MAPNAME).syncMapItems(CallSid)
    .fetch()
  .then(item => {
    console.log(`conference-call-status-callback: found item in syncmap:`, item);
    return client.sync.services(process.env.TWILIO_SYNC_SERVICE)
      .syncMaps(MAPNAME).syncMapItems(CallSid)
      .update({
        data: {status: CallStatus}
      })
  })
  .then(item => {
    console.log(`conference-call-status-callback: updated item in syncmap:`, item);
    response.setStatusCode(204);
    callback(null, response);
  })
  .catch(_err => {
    console.log(`conference-call-status-callback: item not found in syncmap`);
    return client.sync.services(process.env.TWILIO_SYNC_SERVICE)
      .syncMaps(MAPNAME).syncMapItems
      .create({
        key: CallSid,
        data: {status: CallStatus},
        ttl: 3600
      })
    .then(item => {
      console.log(`conference-call-status-callback: created item in syncmap:`, item);
      response.setStatusCode(204);
      callback(null, response);
    })
    .catch(err => {
      response.setStatusCode(501);
      callback(err);
    });
  })
};
