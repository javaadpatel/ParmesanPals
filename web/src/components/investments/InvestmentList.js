import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {fetchInvestments} from '../../actions';
import {Item, Tab, Menu, Label, Segment, Dimmer, Loader, Popup, Icon, Button} from 'semantic-ui-react';
import {InvestmentStatusEnum} from  '../../constants';
import { ethers } from 'ethers';
import {createGateKeeper, createDuelResolver, createWizardGuild} from '../../ethereum/gateKeeperFactory';
import _ from 'lodash';

class InvestmentList extends React.Component{
    componentDidMount(){
        // this.props.fetchInvestments();
    }


    createWizard = async () => {
        var gateKeeper = await createGateKeeper();
        console.log(gateKeeper);
        // var paymentTxn = await investmentInstance.pay({value: ethers.utils.parseEther(paymentInWei)});
        var txn = await gateKeeper.conjureWizard(3,{value: ethers.utils.parseEther("0.1")});
        await gateKeeper.verboseWaitForTransaction(txn);
        console.log("created");
    }

    moveSet = async () => {
        var resolver = await createDuelResolver();
        console.log(resolver);
//valid 2 - 4
        var isValid = await resolver.isValidMoveSet("0x0303030303000000000000000000000000000000000000000000000000000000");
        console.log(isValid);
    }

    getWizardById = async () =>{
        var wizardGuild = await createWizardGuild();
        var wizardInfo = await wizardGuild.getWizard(5993);
        console.log("wizard 5993");
        console.log(wizardInfo);
        console.log("innate power", wizardInfo[1].toNumber());
    }

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

    renderGetWizardById(){
        return(
           <Button onClick={this.getWizardById}>
               Get Wizard By Id
           </Button>
        )
    }


    renderWizard(){
        return(
           <Button onClick={this.createWizard}>
               Create Wizard
           </Button>
        )
    }

    renderMoves(){
        return(
            <Button onClick={this.moveSet}>
                Check Move Set
            </Button>
        )
    }

    renderWizardDuel(){
        return(
            <Button onClick={this.wizardDuel}>
                Wizard Duel
            </Button>
        )
    }


    render(){
        // if (!this.props.investments){
        //     return (
        //         <Segment padded='very'>
        //             <Dimmer active inverted>
        //             <Loader content='Fetching Investments...' />
        //             </Dimmer>
        //         </Segment>
        //     );
        // }

        return(
            <div>
                {this.renderWizard()}
                {this.renderMoves()}
                {this.renderWizardDuel()}
                {this.renderGetWizardById()}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    //convert state.investments to array
    // return {
    //     investments: Object.values(state.investments),
    //     isSignedIn: state.auth.isSignedIn
    // };
}

export default connect(mapStateToProps, {
    // fetchInvestments
})(InvestmentList);