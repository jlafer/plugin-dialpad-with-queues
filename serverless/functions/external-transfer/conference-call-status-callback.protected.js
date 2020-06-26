/*
  This is the call status callback for conferences[CFxxx].participants.create.
Event:
    conferenceSid - the sid of the conference to which a call is being added
*/

exports.handler = async (context, event, callback) => {
  const { CallSid, CallStatus} = event;
  console.log(`conference-call-status-callback: received event:`, event);
  //const tokenResponse = tokenGenerator('cust');
  //getSyncClientAndMap(startTest(state), syncMapUpdated(state), 'TestSteps', tokenResponse);
  //console.log(`statusCallback: received ${CallStatus} for call ${CallSid}`);
  //const client = context.getTwilioClient();
  const client = context.getTwilioClient();
  const response = new Twilio.Response();
  client.sync.services(process.env.TWILIO_SYNC_SERVICE)
    .syncMaps('callAnsweredMap').syncMapItems(CallSid)
    .fetch()
  .then(item => {
    console.log(`conference-call-status-callback: found item in syncmap:`, item);
    return client.sync.services(process.env.TWILIO_SYNC_SERVICE)
      .syncMaps('callAnsweredMap').syncMapItems(CallSid)
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
      .syncMaps('callAnsweredMap').syncMapItems
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
