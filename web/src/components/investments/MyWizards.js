import React from 'react';
import { Icon, Button, Grid, Segment, Loader, Dimmer } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { getWizardsByOwner, createWizard } from '../../actions';
import WizardCard from './WizardCard';
import { createGateKeeper } from '../../ethereum/gateKeeperFactory';
import { ethers } from 'ethers';
import DismissableAlert from './DismissableAlert';

class MyWizards extends React.Component {
  constructor (props) {
    super(props);
  }

  createWizard = async () => {
    try {
      const gateKeeper = await createGateKeeper();
      const txn = await gateKeeper.conjureWizard(3,{ value: ethers.utils.parseEther("0.1") });
      await gateKeeper.verboseWaitForTransaction(txn);
      this.setState({
        alert: { type: 'success', msg: 'Wizard created!' }
      });
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    const  { loadingWizards, selectedAddress, fetchWizardsByOwner, ownedWizards } = this.props;
    // TODO: stop the infinite loop
    // props.selectedAddress && props.fetchWizardsByOwner(props.selectedAddress)
    return (
      <div>
        { 
          this.props.createWizardResult.successful || this.props.createWizardResult.error && 
          <DismissableAlert
            success={this.props.createWizardResult.successful}
            error={this.props.createWizardResult.error}
            header={this.props.createWizardResult.successful && 'Successful' || this.props.createWizardResult.error && 'Unsuccessful' }
            content={ this.props.createWizardResult.successful && 'Wizard created!' || this.props.createWizardResult.error && 'Wizard creation unsuccessful' } />
        }
        <div>
          <Button 
            disabled={loadingWizards} 
            onClick={e => selectedAddress && fetchWizardsByOwner(selectedAddress)}>
              Summon My Wizards
          </Button>
          <Button onClick={this.props.createWizard}> Create Wizard </Button>
        </div>
        {
          loadingWizards && (
            <Segment className='transparent' padded textAlign='center' >
              <Icon name='circle notch' loading size='big' color='yellow' />
              <h2>Summoning your wizards...</h2>
            </Segment>
          )
        }
        {
          ownedWizards && (
            <Segment padded className='transparent'>
              <Grid stackable columns='3'>
                {ownedWizards.map(w => (
                  <Grid.Column key={w.id}>
                    <WizardCard wizard={w} />
                  </Grid.Column>
                ))}
              </Grid>
            </Segment>
          )
        }
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    ownedWizards: state.fetchWizards.ownedWizards,
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
  createWizard: () => dispatch(createWizard())
});

export default connect(mapStateToProps, mapPropsToDispatch)(MyWizards);