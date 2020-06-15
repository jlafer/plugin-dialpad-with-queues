/*
  This is the status event callback for twiml.dial().conference, called when
  parties join or the conference ends.
  on.participant-joined:
    If the call was to a WebRTC client and this is the dialing party
      add conference details to task attributes
      create task for dialed queue or agent; add task.sid to attributes
      update attributes of calling agent's task
  on conference-end:
    update task.assignmentStatus to wrapping or cancelled for both agent's task
 */
const fetchTask = (client, taskSid) => 
    client.taskrouter.workspaces(process.env.TWILIO_WORKSPACE_SID)
        .tasks(taskSid)
        .fetch();

const updateTaskAttributes = (client, taskSid, attributes) => 
    client.taskrouter.workspaces(process.env.TWILIO_WORKSPACE_SID)
        .tasks(taskSid)
        .update({
          attributes: JSON.stringify(attributes)
        });

/*
  Creates Task for the called agent.
*/
const addTaskForTarget = (client, conferenceSid, taskSid, targetType, to, from) => {
  const attributes = {
    targetType,
    to: to,
    name: from,
    from: process.env.TWILIO_NUMBER,
    autoAnswer: 'false',
    conferenceSid: taskSid,
    conference: {
      sid: conferenceSid,
      friendlyName: taskSid
    },
    internal: 'true',
    client_call: true,
  };
  console.log('addTaskForTarget: TWILIO_WORKSPACE_SID:', process.env.TWILIO_WORKSPACE_SID);
  console.log('addTaskForTarget: TWILIO_NUMBER:', attributes.from);
  if (targetType === 'agent') {
    attributes.targetWorker = to;
  }
  console.log('addTaskForTarget: attributes:', attributes);
  //JLAFER commented out check for client-type target, to create tasks when target is queue
  //if (to.substring(0, 6) === 'client') {
    return client.taskrouter.workspaces(process.env.TWILIO_WORKSPACE_SID).tasks
      .create(
        {
          attributes: JSON.stringify(attributes),
          workflowSid: process.env.TWILIO_WORKFLOW_SID,
          taskChannel: 'voice'
        }
      )
  //}
};

exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();
  const { FriendlyName: taskSid, ConferenceSid, CallSid} = event;
  let attributes = {};
  if (event.StatusCallbackEvent === 'participant-join') {
    console.log(`callSid ${CallSid} joined, task is ${taskSid}, conference is ${ConferenceSid}`);
    // get the Call for the added participant
    const call = await client.calls(CallSid).fetch();
    if (call.to.includes('client')) {
      console.log(`agent ${call.to} joined the conference`);
      // get the dialing task that was assigned to the calling worker
      const task = await fetchTask(client, taskSid);
      attributes = {
        ...JSON.parse(task.attributes),
        conference: {
          sid: ConferenceSid,
          participants: {
            worker: CallSid   // new participant's Call sid
          }
        }
      }
      // worker_call_sid is apparently set by TR during reservation.call
      // if the dialing worker is the participant just added 
      if (attributes.worker_call_sid === attributes.conference.participants.worker) {
        // get 'to' which is the dialed worker's contact_uri OR a TaskQueue name
        const { to, from, targetType } = attributes;
        // create Task for the dialed agent
        const result = await addTaskForTarget(client, ConferenceSid, taskSid, targetType, to, from);
        console.log('result:', result);
        // save the called agent's task sid in the calling agent's task attributes
        // for use in cleanup at conference-end (see below)
        attributes.conference.participants.taskSid = result.sid;
        await updateTaskAttributes(client, taskSid, attributes);
      }
    }
  }
  
  if (event.StatusCallbackEvent === 'conference-end') {
      try {
        const task = await fetchTask(client, taskSid);
        const attributes = JSON.parse(task.attributes);
        const targetTaskSid = attributes.conference.participants.taskSid;

        if(["assigned", "pending", "reserved"].includes(task.assignmentStatus)) {
          await client.taskrouter.workspaces(context.TWILIO_WORKSPACE_SID)
            .tasks(taskSid)
            .update({
              assignmentStatus: task.assignmentStatus === "assigned" ? 'wrapping' : 'canceled',
              reason: 'conference is complete'
            })
        }
        if(targetTaskSid){
          const { assignmentStatus } = await fetchTask(client, targetTaskSid);
          if(["assigned", "pending", "reserved"].includes(assignmentStatus)) {
            await client.taskrouter.workspaces(context.TWILIO_WORKSPACE_SID)
              .tasks(targetTaskSid)
              .update({
                assignmentStatus: assignmentStatus === "assigned" ? 'wrapping' : 'canceled',
                reason: 'conference is complete'
              })
          }
        }
      } catch (err) {
        console.log(err);
      }
  }
  callback(null);
};