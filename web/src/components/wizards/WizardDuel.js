import React from 'react';
import { Icon, Button, Grid, Segment, Label, Header } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { getWizardsByOwner, createWizard, fetchRegisteredWizards } from '../../actions';
import {createDuelResolver} from '../../ethereum/gateKeeperFactory';
import BattleWizardCard from './BattleWizardCard';
import _ from 'lodash';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider, { Range } from 'rc-slider';

class WizardDuel extends React.Component {
  state = {
    powerTransferPossibilities: {}, 
    selectedPowerPossibility: 0,
    selectedWalletWizardIndex: 0, 
    selectedRegisteredWizardIndex: 0,
    generatingDuelResults: false,
    powerMarkers: {},
    activePowerMarker: 0,
    registeredWizardPowerPricePerEth: 0
  };

  componentDidMount() {
    this.props.fetchWizardsByOwner(this.props.selectedAddress);
    this.props.fetchRegisteredWizards();
  }

  //this is problematic
  renderWalletBattleWizard = () => {
    if (!_.isEmpty(this.props.ownedWizards)){
      return (
        <Segment className='transparent' textAlign='center'>
          <BattleWizardCard wizard={this.props.ownedWizards[this.state.selectedWalletWizardIndex]} />
          <Label color='teal' image>
            Owned Wizards
            <Label.Detail>{this.state.selectedWalletWizardIndex + 1}/{this.props.ownedWizards.length}</Label.Detail>
          </Label>
          <Segment className='transparent'>
            <Button 
              disabled={this.state.selectedWalletWizardIndex === 0}
              floated='left' 
              icon='arrow left' 
              size='big'
              color='olive'
              onClick={e => this.previousWalletWizard()} 
              />
            <Button 
              disabled={this.state.selectedWalletWizardIndex === this.props.ownedWizards.length - 1}
              color='olive'
              floated='right' 
              icon='arrow right' 
              size='big' 
              onClick={e => this.nextWalletWizard()} />
          </Segment>
        </Segment>
      )
    }
  }

  renderRegisteredBattleWizard = () => {
    if (!_.isEmpty(this.props.registeredWizards)) {
      return (
        <Segment className='transparent' textAlign='center'>
          <BattleWizardCard wizard={this.props.registeredWizards[this.state.selectedRegisteredWizardIndex]} />
          <Label color='teal' image>
            Registered Wizards
            <Label.Detail>{this.state.selectedRegisteredWizardIndex + 1}/{this.props.registeredWizards.length}</Label.Detail>
          </Label>
          <Segment className='transparent'>
            <Button 
              disabled={this.state.selectedRegisteredWizardIndex === 0}
              color='blue'
              floated='left' 
              icon='arrow left' 
              size='big' onClick={e => this.previousRegisteredWizard()} />
            <Button
              disabled={this.state.selectedRegisteredWizardIndex === this.props.registeredWizards.length - 1}
              color='blue'
              floated='right' 
              icon='arrow right' 
              size='big' 
              onClick={e => this.nextRegisteredWizard()} />
          </Segment>

        </Segment>
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
    this.setState({ generatingDuelResults: true });
    
    const numberOfRounds = 5;
    //calculate power transfer possiblities for round5 wins
    var allPowerTransferPossibilities = {};

    //extract required information from battling wizards
    const wizardAPower = this.props.ownedWizards[this.state.selectedWalletWizardIndex].power;
    const wizardBPower = this.props.registeredWizards[this.state.selectedRegisteredWizardIndex].power;
    const wizardAAffinity = this.props.ownedWizards[this.state.selectedWalletWizardIndex].affinity;
    const wizardBAffinity = this.props.registeredWizards[this.state.selectedRegisteredWizardIndex].affinity;
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
    this.setState({ generatingDuelResults: false });
    this.setState({ powerTransferPossibilities: allPowerTransferPossibilities });
    this.configureValuesForPowerTransferSlider();
  }

  configureValuesForPowerTransferSlider = () => {
    if (!_.isEmpty(this.state.powerTransferPossibilities)){
      var powerTransferPossibilitiesMarks = {};
      const sortedPowerTransferPossibilities = _(this.state.powerTransferPossibilities).toPairs().sortBy(0).fromPairs().value();
      Object.keys(sortedPowerTransferPossibilities).map((powerTransferPossibility)=> {
        //inverse because they are all negative
        powerTransferPossibilitiesMarks[-powerTransferPossibility] = -powerTransferPossibility;
      });
      var minPowerPossiblity = Object.keys(powerTransferPossibilitiesMarks)[0];
      // var maxPowerPossibility = Object.keys(powerTransferPossibilitiesMarks)[-1];
      var lastIndex = Object.keys(powerTransferPossibilitiesMarks).length-1;
      var maxPowerPossibility = Object.keys(powerTransferPossibilitiesMarks)[lastIndex]
      console.log("min transfer", minPowerPossiblity);
      console.log("maxTransfer:", maxPowerPossibility);
      const powerKeys = Object.keys(powerTransferPossibilitiesMarks);
      const powerMarkers = powerKeys.reduce((acc, k, i) => { acc[i] = Number(powerTransferPossibilitiesMarks[k]); return acc; }, {});
      this.setState({ powerMarkers });
      this.setState({ selectedPowerPossibility: this.state.powerMarkers[this.state.activePowerMarker] });
      this.updateEthPerPowerUnit(this.state.selectedRegisteredWizardIndex);
    }
  }

  onSliderChange = (key) => {
    this.setState({ activePowerMarker: key });
    this.setState({ selectedPowerPossibility: this.state.powerMarkers[key] });
  }

  nextWalletWizard() {
    const isAtLastWizard = this.state.selectedWalletWizardIndex === this.props.ownedWizards.length - 1;
    const newIndex = this.state.selectedWalletWizardIndex + 1;
    if(!isAtLastWizard) {
      this.setState({ selectedWalletWizardIndex: newIndex, powerTransferPossibilities: {} });
    }
  }

  previousWalletWizard() {
    const isFirstWizard = this.state.selectedWalletWizardIndex === 0;
    const newIndex = this.state.selectedWalletWizardIndex - 1;
    
    if(!isFirstWizard) {
      this.setState({ selectedWalletWizardIndex: newIndex, powerTransferPossibilities: {} });
    }
  }

  nextRegisteredWizard() {
    const isAtLastWizard = this.state.selectedRegisteredWizardIndex === this.props.registeredWizards.length - 1;
    const newIndex = this.state.selectedRegisteredWizardIndex + 1;
    if(!isAtLastWizard) {
      this.setState({ selectedRegisteredWizardIndex: newIndex, powerTransferPossibilities: {} });
      this.updateEthPerPowerUnit(newIndex);
    }
  }

  previousRegisteredWizard() {
    const isFirstWizard = this.state.selectedRegisteredWizardIndex === 0;
    const newIndex = this.state.selectedRegisteredWizardIndex - 1;
    if(!isFirstWizard) {
      this.setState({ selectedRegisteredWizardIndex: newIndex, powerTransferPossibilities: {} });
      this.updateEthPerPowerUnit(newIndex);
    }
  }

  updateEthPerPowerUnit(registerdWizardIndex) {
    this.props.registeredWizards.length && this.setState({ registeredWizardPowerPricePerEth: Number(this.props.registeredWizards[registerdWizardIndex].pricePerPowerInEther) })
  }

  render() {
    if (this.props.registeredWizardsLoading) {
      return (
      <Segment className='transparent' padded textAlign='center' >
        <Icon name='circle notch' loading size='big' color='yellow' />
        <h2>Summoning the wizards to the duel...</h2>
      </Segment>
      )
    }

    return (
      <>
        <Grid verticalAlign='middle' columns={3} centered>
          <Grid.Row>
            <Grid.Column>
              {this.renderWalletBattleWizard()}
            </Grid.Column>
            <Grid.Column stretched>
              <Segment textAlign='center' className='transparent'>
                <p>Power Transfer</p>
                <Icon name='long arrow alternate left' color='yellow' size='huge' />
              </Segment>
              <Button 
                loading={this.state.generatingDuelResults}
                inverted
                color='yellow'
                onClick={this.onGeneratePossibleDuelResults}
              >
                Generate Possible Duel Results
              </Button>
            </Grid.Column>
            <Grid.Column>
              {this.renderRegisteredBattleWizard()}
            </Grid.Column>
          </Grid.Row>
        </Grid>
        {
          !_.isEmpty(this.state.powerTransferPossibilities) && (
            <>
              <Header as='h2' dividing color='orange'>
                All Possible Power Transfers
              </Header>
              <Segment className='transparent' textAlign='center'>
                <h3>
                  <Icon color='yellow' name='lightning' size='big' />
                  Selected Power to transfer: &nbsp;
                  {this.state.selectedPowerPossibility == 0 ? this.state.powerMarkers['0']: this.state.selectedPowerPossibility}
                </h3>
                <h3>
                  <Icon name='ethereum' color='purple' size='big'/> Price per unit of Power (ETH): &nbsp;
                  {(this.state.registeredWizardPowerPricePerEth || 0)}
                </h3>
                <h3>
                  <Icon name='ethereum' color='purple' size='big'/> Power transfer price (ETH): &nbsp;
                  {(this.state.registeredWizardPowerPricePerEth || 0) * (this.state.selectedPowerPossibility || 0)}
                </h3>
                <Slider 
                  min={0}
                  defaultValue={0}
                  max={Object.keys(this.state.powerMarkers).length - 1}
                  marks={this.state.powerMarkers}
                  step={null}
                  onChange={this.onSliderChange} />
                  <Label pointing='above' color='blue'>Use the slider to select the desired power transfer</Label>
              </Segment>
            </>
          )
        }
      </>
    )
  }
}

const mapStateToProps = state => {
  return {
    ownedWizards: state.fetchWizards.ownedWizards,
    registeredWizards: state.registeredWizards.registeredWizards,
    registeredWizardsLoading: state.registeredWizards.loading,
    registeredWizardsError: state.registeredWizards.error,
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