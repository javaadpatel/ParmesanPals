import etherlime from 'etherlime';
import GateKeeper from '../contracts/InauguralGateKeeper.json';
import DuelResolver from '../contracts/ThreeAffinityDuelResolver.json';
import WizardGuild from '../contracts/WizardGuild.json';
import Web3 from 'web3';
import { ethers } from 'ethers';
import {investmentFactoryContractAddress, rinkebyProviderUrl} from '../configuration';

let ethersProvider;

//running in the browser & metamask is available
if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined'){
    window.ethereum.enable();
    ethersProvider = new ethers.providers.Web3Provider(window.web3.currentProvider);
}
//running on server *OR* user is not running metamask
else{
    const provider = new Web3.providers.HttpProvider(
        rinkebyProviderUrl
    );
    ethersProvider = new ethers.providers.Web3Provider(provider);
}

export const createGateKeeper = async () => {
    const signer = await ethersProvider.getSigner();
    return await etherlime
        .ContractAt(GateKeeper, "0xF46aEEF279A6d5A411E16D87D3767fDa0cEC320E", signer, ethersProvider);
}

export const createDuelResolver = async () => {
    const signer = await ethersProvider.getSigner();
    return await etherlime
        .ContractAt(DuelResolver, "0xB789e4047f5DF6cf5Fdd035AF44205092a275d33", signer, ethersProvider);
}

export const createWizardGuild = async () => {
    const signer = await ethersProvider.getSigner();
    return await etherlime
        .ContractAt(WizardGuild, "0xd3d2Cc1a89307358DB3e81Ca6894442b2DB36CE8", signer, ethersProvider);
}

