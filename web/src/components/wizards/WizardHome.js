import React from 'react';
import {connect} from 'react-redux';
import { Icon, Button } from 'semantic-ui-react';
import { ethers } from 'ethers';
import { createDuelResolver, createWizardGuild } from '../../ethereum/gateKeeperFactory';
import _ from 'lodash';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';

class InvestmentList extends React.Component{
    state = {powerTransferPossibilities: {}, selectedPowerPossibility: 0};

    constructor(props) {
      super(props);
    }


    moveSet = async () => {
        var resolver = await createDuelResolver();
        console.log(resolver);
        //valid 2 - 4
        var isValid = await resolver.isValidMoveSet("0x0303030303000000000000000000000000000000000000000000000000000000");
        console.log(isValid);
    }

    

    getWizardById = async () => {
        var wizardGuild = await createWizardGuild();
        var wizardInfo = await wizardGuild.getWizard(6000);
        console.log("wizard 5993");
        console.log(wizardInfo);
        console.log("innate power", wizardInfo[1].toNumber());
    }

    /**
     * 
     * @param {number} affinity1 the affinity for the seller wizard
     * @param {number} affinity2 the affinity of the buyer wizard
     */
    calculateSimulatedDuelResults() {
      // Results in 1 if p1 beats p2, -1 if p2 beats p1
      // 3 (water) beats 0 (fire) = (1)  | 0 (fire) loses to 1 (water) = (-1)
      // 4 (wind) beats 1 (water) = (1)  | 1 (water) loses to 2 (wind) = (-1)
      // 2 (fire) beats 2 (wind)  = (-2) | 2 (wind) loses to 0 (fire)  = (2)
      const movesConstant = [2,2,2,2];
      const possibleMoves = [this.moveEnum.fire, this.moveEnum.water, this.moveEnum.wind];
      // const getWinningMoves = possibleMoves.map(this.getWinningMoveFor);

      const moves = possibleMoves.reduce((duels, possibleMove, i) => {
        const winningMove = this.getWinningMoveFor(possibleMove);
        const wizardAMoves = movesConstant.concat(possibleMove);
        const wizardBMoves = movesConstant.concat(winningMove);
        duels[i] = {  
          wizardAMoves,
          wizardBMoves
        }
        return duels;
      }, {});
      return moves;
    }

    calculateSimulatedDuelResultsV2(winningRound) {
      console.log("simulate round", winningRound);
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

    simulateDuels = async (duels) => {
      var resolver = await createDuelResolver();
      var powerMoveMapping = {};
      // console.log(duels);
      const powerPossibilities = await Promise.all(Object.keys(duels).map(async (k) => {
        const moveSet1 = this.buildMoveSet(duels[k].wizardAMoves);
        const moveSet2 = this.buildMoveSet(duels[k].wizardBMoves);
        // console.log({
        //   moveSet1,
        //   moveSet2
        // })
        var power1 = 71377491748132; //id 5993
        var power2 = 140091000000000; //id 5977
        var affinity1 = 3;
        var affinity2 = 4;
        var powers = await resolver.resolveDuel(moveSet1, moveSet2, power1, power2, affinity1, affinity2);
        console.log("power to transfer", powers.toNumber());
        // return powers.toNumber();
        powerMoveMapping[powers.toNumber()] = {wizardAMoves: moveSet1, wizardBMoves: moveSet2};
      }));

      return powerMoveMapping;
    }

    //test function no longer used
    wizardDuel = async () => {
        // function resolveDuel(
        //     bytes32 moveSet1,
        //     bytes32 moveSet2,
        //     uint256 power1,
        //     uint256 power2,
        //     uint256 affinity1,
        //     uint256 affinity2)
        //     public pure returns(int256 power)
        var resolver = await createDuelResolver();
        console.log(resolver);
//valid 2 - 4
        var moveSet1 = "0x0403030303000000000000000000000000000000000000000000000000000000";
        var moveSet2 = "0x0403030304000000000000000000000000000000000000000000000000000000";
        var power1 = 71377491748132; //id 5993
        var power2 = 140091000000000; //id 5977
        var affinity1 = 3;
        var affinity2 = 4;
        var powers = await resolver.resolveDuel(moveSet1, moveSet2, power1, power2, affinity1, affinity2);
        console.log("power to transfer", powers.toNumber());
    }

    onGeneratePossibleDuelResults = async () => {
      const numberOfRounds = 5;
      //calculate power transfer possiblities for round5 wins
      var allPowerTransferPossibilities = {};
      for(var i = 1; i <= numberOfRounds; i++){
        console.log('simulating round:', i);
        var duelMoves = await this.calculateSimulatedDuelResultsV2(i);
        console.log({duelMoves});
        // //calculate power transfer possibilities for round4 wins
        const duelResults = await this.simulateDuels(duelMoves);
        console.log(`power possibilities in round ${i}`,_.cloneDeep(duelResults));
        Object.keys(duelResults).map((duelResult) => {
          allPowerTransferPossibilities[duelResult] = duelResults[duelResult];
        });
      }

      console.log("all duel results", allPowerTransferPossibilities);

      this.setState({powerTransferPossibilities: allPowerTransferPossibilities});
    };

    buildMoveSet(moves) {
      const temp = '0x' + moves.map(m => `0${m}`).join('');
      return temp + '0'.repeat(54);
    }

    renderSimulateWizardDual = () => <Button onClick={this.onGeneratePossibleDuelResults}>Generate Possible Duel Results</Button>;

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

    render() {
        return(
            <div>
              <p>Selected address: {this.props.selectedAddress}</p>
              <p title={!this.props.incorrectNetworkSelected ? 'Connected to Rinkeby' : ''}>
                Network: &nbsp;
                {
                  this.props.incorrectNetworkSelected ? 
                    <span ><Icon color='red' name='circle thin' size='large' /> Needs Rinkeby Test Network</span> : 
                    <Icon  color='green' name='circle thin' size='large' />
                }
              </p>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
  return {
    selectedAddress: state.ethProvider.selectedAddress,
    incorrectNetworkSelected: state.ethProvider.networkVersion !== '4',
  };
}

export default connect(mapStateToProps, null)(InvestmentList);