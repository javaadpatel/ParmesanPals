import React from 'react';
import { Icon, Button, Grid, Image, Loader, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { getWizardsByOwner, createWizard, fetchRegisteredWizards } from '../../actions';
import BattleWizardCard from './BattleWizardCard';
import { createGateKeeper } from '../../ethereum/gateKeeperFactory';
import { ethers } from 'ethers';
import DismissableAlert from './DismissableAlert';
import _ from 'lodash';

class WizardDuel extends React.Component {

  componentDidMount(){
    this.props.fetchWizardsByOwner(this.props.selectedAddress);
    this.props.fetchRegisteredWizards();
  }

  //this is problematic
  renderWalletBattleWizard = () => {
    if (!_.isEmpty(this.props.ownedWizards)){
      return(
        <BattleWizardCard wizard={this.props.ownedWizards[0]} />
        )
      }
  }

  renderRegisteredBattleWizard = () => {
    if (!_.isEmpty(this.props.registeredWizards)){
      return(
        <BattleWizardCard wizard={this.props.registeredWizards[0]} />
        )
      }
  }
  
  render(){
    const  { loadingWizards, selectedAddress, fetchWizardsByOwner, ownedWizards } = this.props;
        // <div>
         if (!this.props.ownedWizards){
           return (
            <Segment className='transparent' padded textAlign='center' >
              <Icon name='circle notch' loading size='big' color='yellow' />
              <h2>Summoning your wizards...</h2>
            </Segment>
           )
         }

         return(
        <Grid verticalAlign='middle' columns={3} centered>
            <Grid.Row>
              <Grid.Column>
                {this.renderWalletBattleWizard()}
              </Grid.Column>
              <Grid.Column stretched>
                <Button>
                  Simulate Duel
                </Button>
              </Grid.Column>
              <Grid.Column>
                {this.renderRegisteredBattleWizard()}
              </Grid.Column>
            </Grid.Row>
          </Grid>
         )
            
        }
}

const mapStateToProps = state => {
  return {
    ownedWizards: state.fetchWizards.ownedWizards,
    registeredWizards: state.registeredWizards.registeredWizards,
    loadingWizards: state.fetchWizards.loading,
    selectedAddress: state.ethProvider.selectedAddress,
    incorrectNetworkSelected: state.ethProvider.incorrectNetworkSelected,
    createWizardResult: {
      successful: state.createWizard.successful,
      error: state.createWizard.error
    }
  };
}

const mapPropsToDispatch = dispatch => ({
  fetchWizardsByOwner: ownerAddress => dispatch(getWizardsByOwner(ownerAddress)),
  createWizard: () => dispatch(createWizard()),
  fetchRegisteredWizards: () => dispatch(fetchRegisteredWizards())
});

export default connect(mapStateToProps, mapPropsToDispatch)(WizardDuel);