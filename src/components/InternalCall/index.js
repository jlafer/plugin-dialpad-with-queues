/*
  This module provides the loadInternalCallInterface function which is
  responsible for adding the custom React components, which support the
  internal-call feature, to the native dialpad.
  It is called from DialpadPlugin.init. It also provides 'makeInternalCall'.
*/
import React from "react";
import InternalDialpad from './InternalDialpad';

export const loadInternalCallInterface = (flex, manager) => {
  flex.OutboundDialerPanel.Content.add(
    <InternalDialpad key="select-dialpad" flex={flex} manager={manager} />
  )
}

/*
  This function initiates the placing of an internal call by creating a custom task
  that is routed back to this worker. The attributes of the task insure it is routed
  to only this worker and provides the required information to make the calls and add
  them to a conference.

  Parameters:
     selectedTarget - the contact_uri of the worker to call 
    workerList - list of all worker objects 

  NOTE: JLAFER - there is no need to pass the list of all workers;
    only the  selectedTarget friendly_name is needed
*/
export const makeInternalCall = ({ 
    manager, targetType,  selectedTarget, targetName
}) => {
    const { 
      workflow_sid, 
      queue_sid
    } = manager.serviceConfiguration.outbound_call_flows.default;
    const { REACT_APP_TASK_CHANNEL_SID: taskChannelSid } = process.env;
    const { contact_uri } = manager.workerClient.attributes;
    // this method creates an outbound task
    manager.workerClient.createTask(
      selectedTarget, // to -> attributes.outbound_to
      contact_uri,    // from -> attributes.from
      workflow_sid,   // workflow to handle routing
      queue_sid,      // queue used for reporting only
      { // options
        attributes: {
          targetType,
          to: selectedTarget,
          direction: 'outbound',
          name: targetName,
          from: contact_uri,
          targetWorker: contact_uri,  // target for routing (the calling worker's uri)
          autoAnswer: 'true',
          client_call: true           // WebRTC client call
        },
        taskChannelSid
      }
    );
}