import React from 'react';
import { Icon, Button, Grid, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { getWizardsByOwner, createWizard, fetchRegisteredWizards } from '../../actions';
import {createDuelResolver} from '../../ethereum/gateKeeperFactory';
import BattleWizardCard from './BattleWizardCard';
import _ from 'lodash';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';

class WizardDuel extends React.Component {
  state = {powerTransferPossibilities:{}, selectedPowerPossibility: 0, selectedWalletWizardIndex: 2, selectedRegistedWizardIndex: 0}
  componentDidMount(){
    this.props.fetchWizardsByOwner(this.props.selectedAddress);
    this.props.fetchRegisteredWizards();
  }

  //this is problematic
  renderWalletBattleWizard = () => {
    if (!_.isEmpty(this.props.ownedWizards)){
      return(
        //hard-coding the wizard here, this should come from state and then change
        <BattleWizardCard wizard={this.props.ownedWizards[this.state.selectedWalletWizardIndex]} />
        )
      }
  }

  renderRegisteredBattleWizard = () => {
    if (!_.isEmpty(this.props.registeredWizards)){
      return(
        //hard-coding the wizard here, this should come from state and then change
        <BattleWizardCard wizard={this.props.registeredWizards[this.state.selectedRegistedWizardIndex]} />
        )
      }
  }

  calculateSimulatedDuelResultsV2(winningRound) {
    // Results in 1 if p1 beats p2, -1 if p2 beats p1
    // 3 (water) beats 0 (fire) = (1)  | 0 (fire) loses to 1 (water) = (-1)
    // 4 (wind) beats 1 (water) = (1)  | 1 (water) loses to 2 (wind) = (-1)
    // 2 (fire) beats 2 (wind)  = (-2) | 2 (wind) loses to 0 (fire)  = (2)
    var movesArray = [2,2,2,2,2];
    const possibleMoves = [this.moveEnum.fire, this.moveEnum.water, this.moveEnum.wind];

    const moves = possibleMoves.reduce((duels, possibleMove, i) => {
      var newMovesArrayWizardA = movesArray.slice();
      newMovesArrayWizardA[winningRound-1] = possibleMove;
      const wizardAMoves = newMovesArrayWizardA;
      
      const winningMove = this.getWinningMoveFor(possibleMove);
      var newMovesArrayWizardB = movesArray.slice();
      newMovesArrayWizardB[winningRound-1] = winningMove;
      const wizardBMoves = newMovesArrayWizardB;

      duels[i] = {  
        wizardAMoves,
        wizardBMoves
      }
      return duels;
    }, {});
    return moves;
  }

  moveEnum = {
    fire: 2,
    water: 3,
    wind: 4
  }

  getWinningMoveFor(move) {
    switch(move) {
      case this.moveEnum.fire: return this.moveEnum.water;
      case this.moveEnum.water: return this.moveEnum.wind;
      case this.moveEnum.wind: return this.moveEnum.fire;
      default: throw new Error('Move not recognised');
    }
  }

  simulateDuels = async (duels, wizardAPower, wizardAAffinity, wizardBPower, wizardBAffinity) => {
    var resolver = await createDuelResolver();
    var powerMoveMapping = {};
    await Promise.all(Object.keys(duels).map(async (k) => {
      const moveSet1 = this.buildMoveSet(duels[k].wizardAMoves);
      const moveSet2 = this.buildMoveSet(duels[k].wizardBMoves);
      // var power1 = 71377491748132; //id 5993
      // var power2 = 140091000000000; //id 5977
      // var affinity1 = 3;
      // var affinity2 = 4;
      var powers = await resolver.resolveDuel(moveSet1, moveSet2, wizardAPower, wizardBPower, wizardAAffinity, wizardBAffinity);
      powerMoveMapping[powers.toNumber()] = {wizardAMoves: moveSet1, wizardBMoves: moveSet2};
    }));

    return powerMoveMapping;
  }

  buildMoveSet(moves) {
    const temp = '0x' + moves.map(m => `0${m}`).join('');
    return temp + '0'.repeat(54);
  }

  onGeneratePossibleDuelResults = async () => {
    const numberOfRounds = 5;
    //calculate power transfer possiblities for round5 wins
    var allPowerTransferPossibilities = {};

    //extract required information from battling wizards
    const wizardAPower = this.props.ownedWizards[this.state.selectedWalletWizardIndex].power;
    const wizardBPower = this.props.registeredWizards[this.state.selectedRegistedWizardIndex].power;
    const wizardAAffinity = this.props.ownedWizards[this.state.selectedWalletWizardIndex].affinity;
    const wizardBAffinity = this.props.registeredWizards[this.state.selectedRegistedWizardIndex].affinity;
    console.log(wizardAPower, wizardAAffinity, wizardBPower, wizardBAffinity);

    for(var i = 1; i <= numberOfRounds; i++){
      console.log('simulating round:', i);
      var duelMoves = await this.calculateSimulatedDuelResultsV2(i);
      // //calculate power transfer possibilities for round4 wins
      const duelResults = await this.simulateDuels(duelMoves, wizardAPower, wizardAAffinity, wizardBPower, wizardBAffinity);
      Object.keys(duelResults).map((duelResult) => {
        allPowerTransferPossibilities[duelResult] = duelResults[duelResult];
      });
    }

    console.log(allPowerTransferPossibilities);
    this.setState({powerTransferPossibilities: allPowerTransferPossibilities});
  }

  renderPowerTransferSlider = () =>{
    if (!_.isEmpty(this.state.powerTransferPossibilities)){
      console.log("slider rendering")
      var powerTransferPossibilitiesMarks = {};
      const sortedPowerTransferPossibilities = _(this.state.powerTransferPossibilities).toPairs().sortBy(0).fromPairs().value();
      Object.keys(sortedPowerTransferPossibilities).map((powerTransferPossibility)=> {
        //inverse because they are all negative
        powerTransferPossibilitiesMarks[-powerTransferPossibility] = -powerTransferPossibility;
      });
      console.log(powerTransferPossibilitiesMarks);
      var minPowerPossiblity = Object.keys(powerTransferPossibilitiesMarks)[0];
      // var maxPowerPossibility = Object.keys(powerTransferPossibilitiesMarks)[-1];
      var lastIndex = Object.keys(powerTransferPossibilitiesMarks).length-1;
      var maxPowerPossibility = Object.keys(powerTransferPossibilitiesMarks)[lastIndex]
      console.log("min transfer", minPowerPossiblity);
      console.log("maxTransfer:", maxPowerPossibility);
      return (
        <div>
          <p>Selected power: {this.state.selectedPowerPossibility == 0 ? minPowerPossiblity: this.state.selectedPowerPossibility}</p>
        <Slider 
          min={Number(minPowerPossiblity)} 
          defaultValue={Number(minPowerPossiblity)} 
          max={Number(maxPowerPossibility)} 
          marks={powerTransferPossibilitiesMarks} 
          step={null} 
          onChange={this.onSliderChange}/>
        </div>
      );
    }
  }

  onSliderChange = (value) => {
    console.log(value);
    this.setState({selectedPowerPossibility: value});
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
           <>
        <Grid verticalAlign='middle' columns={3} centered>
            <Grid.Row>
              <Grid.Column>
                {this.renderWalletBattleWizard()}
              </Grid.Column>
              <Grid.Column stretched>
                <Button onClick={this.onGeneratePossibleDuelResults}>
                  Generate Possible Duel Results
                </Button>
              </Grid.Column>
              <Grid.Column>
                {this.renderRegisteredBattleWizard()}
              </Grid.Column>
            </Grid.Row>
          </Grid>
               {this.renderPowerTransferSlider()}
           </>
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