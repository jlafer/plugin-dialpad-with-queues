/*
  This is a modal dialog that supports dialing another agent.
  When the 'Call' button is pressed, this module's 'makeInternalCall' function
  is called, which creates a dialing Task.
*/
import React from 'react';

import sharedTheme from '../../styling/theme.js';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import { Icon } from '@twilio/flex-ui';
import { withStyles } from '@material-ui/core/styles';
import { makeInternalCall } from './index';

const styles = theme => (sharedTheme(theme));

class InternalDialpad extends React.Component {
  state = {
    queueList: [],
    workerList: [], 
    selectedQueue: null,
    selectedWorker: null,
    searchQuery: "" 
  };
  
  async componentDidMount() {
    this.setWorkers(this.state.searchQuery);
    this.setQueues(this.state.searchQuery);
  }

  // search in Sync for all taskrouter workers
  // JLAFER this won't scale well for enterprise customers; for them, only
  //   queue selection or a smaller subset of agents will perform well
  setWorkers = (query) => {
    this.props.manager.insightsClient.instantQuery('tr-worker').then((q) => {
      q.on('searchResult', (items) => {
        this.setState({ workerList: Object.keys(items).map(workerSid => items[workerSid]) });
      });
      q.search(query);
    });
  }

  setQueues = (query) => {
    this.props.manager.insightsClient.instantQuery('tr-queue').then((q) => {
      q.on('searchResult', (items) => {
        this.setState({ queueList: Object.keys(items).map(queueSid => items[queueSid]) });
        console.log('setQueues:', items);
      });
      q.search(query);
    });
  }

  handleChange = event => {
    this.setState({ selectedWorker: event.target.value})
  }

  handleQueueChange = event => {
    this.setState({ selectedQueue: event.target.value})
  }

  makeCall = () => {
    if (this.state.selectedWorker != null) {
      const { manager } = this.props;
      const selectedWorker = this.state.workerList.find(worker => 
        worker.attributes.contact_uri ===  this.state.selectedWorker);
      const {friendly_name} = selectedWorker;
      makeInternalCall({ 
        manager, 
        targetType: 'agent',
        selectedTarget: this.state.selectedWorker, 
        targetName: friendly_name 
      });
    }
  }

  makeQueueCall = () => {
    if (this.state.selectedQueue != null) {
      const { manager } = this.props;
      const selectedQueue = this.state.queueList.find(queue => 
        queue.queue_name ===  this.state.selectedQueue);
      const {queue_name} = selectedQueue;
      makeInternalCall({ 
        manager, 
        targetType: 'queue',
        selectedTarget: queue_name,
        targetName: queue_name
      });
    }
  }

  render() {       
    const { classes, manager } = this.props;
    const { contact_uri: worker_contact_uri }  = 
      manager.workerClient.attributes;
    return (
      <div className={classes.boxDialpad}>
        <div className={classes.titleAgentDialpad}>Call via Queue</div>
        <div className={classes.subtitleDialpad}>Select Queue</div>
        <FormControl className={classes.formControl}>
          <Select
            value={this.state.selectedQueue}
            onChange={this.handleQueueChange}
            isClearable
          >
            {this.state.queueList.map((queue)=> {
              const { queue_name, queue_sid } = queue;
              return (
                <MenuItem value={queue_name} key={queue_sid}>
                  {queue_name}
                </MenuItem>
              )
            })}
          </Select>
          <div className={classes.buttonAgentDialpad}>
            <Button 
              variant="contained" 
              color="primary" 
              disabled={!this.state.selectedQueue} 
              onClick={this.makeQueueCall}
              className={classes.dialPadBtn}
            >
              <Icon icon="Call"/>
            </Button>
          </div>
        </FormControl>
        <div className={classes.titleAgentDialpad}>Call Agent</div>
        <div className={classes.subtitleDialpad}>Select agent</div>
        <FormControl className={classes.formControl}>
          <Select
            value={this.state.selectedWorker}
            onChange={this.handleChange}
            isClearable
          >
            {this.state.workerList.map((worker)=> {
                const { activity_name } = worker;
                const { contact_uri, full_name } = worker.attributes;
                return (
                  contact_uri !== worker_contact_uri && 
                  activity_name !== "Offline" 
                ) ? (
                  <MenuItem value={contact_uri} key={contact_uri}>
                    {full_name}
                  </MenuItem>
                ) : null
              })}
          </Select>
          <div className={classes.buttonAgentDialpad}>
            <Button 
              variant="contained" 
              color="primary" 
              disabled={!this.state.selectedWorker} 
              onClick={this.makeCall}
              className={classes.dialPadBtn}
            >
              <Icon icon="Call"/>
            </Button>
          </div>
        </FormControl>
      </div>
    )
  }
}

export default withStyles(styles)(InternalDialpad);