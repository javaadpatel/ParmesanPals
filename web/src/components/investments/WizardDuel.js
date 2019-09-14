import React from 'react';
import { Icon, Button, Grid, Segment, Loader, Dimmer } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { getWizardsByOwner, createWizard } from '../../actions';
import WizardCard from './WizardCard';
import { createGateKeeper } from '../../ethereum/gateKeeperFactory';
import { ethers } from 'ethers';
import DismissableAlert from './DismissableAlert';

class WizardDuel extends React.Component {
  constructor (props) {
    super(props);
  }

  render(){
      return(
          <div>duel simulation</div>
      )
  }

}

export default WizardDuel;