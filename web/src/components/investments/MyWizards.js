import React from 'react';
import { Card,Image,Icon,Divider,Button,Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { getWizardsByOwner } from '../../actions';
import WizardCard from './WizardCard';

const MyWizards = (props) => {
  const isLoadingMyWizards = props.loadingWizards;
  // TODO: stop the infinite loop
  // props.selectedAddress && props.fetchWizardsByOwner(props.selectedAddress)
  return (
    <div>
      <div>
        <Button disabled={isLoadingMyWizards} onClick={e => props.selectedAddress && props.fetchWizardsByOwner(props.selectedAddress)}>Summon My Wizards</Button>
      </div>
      {
        isLoadingMyWizards && (
          <center>
            <Icon loading name='circle notch' size='big' />
            <h2>Summoning your wizards...</h2>
          </center>
        )
      }
      {
        props.ownedWizards && (
          <div>
            <Grid stackable columns='equal'>
              {props.ownedWizards.map(w => (
                <Grid.Column>
                  <WizardCard key={w.id} wizard={w} />
                </Grid.Column>
              ))}
            </Grid>
          </div>
        )
      }
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    ownedWizards: state.fetchWizards.ownedWizards,
    loadingWizards: state.fetchWizards.loading,
    selectedAddress: state.ethProvider.selectedAddress,
    incorrectNetworkSelected: state.ethProvider.incorrectNetworkSelected
  };
}

const mapPropsToDispatch = dispatch => ({
  fetchWizardsByOwner: ownerAddress => dispatch(getWizardsByOwner(ownerAddress))
});

export default connect(mapStateToProps,mapPropsToDispatch)(MyWizards);