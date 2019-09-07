import etherlime from 'etherlime';
import InvestmentFactory from '../contracts/InvestmentFactory.json';
import uPortConnect from './uPortConnect';
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

export const createInvestmentFactory = async () => {
    const signer = await ethersProvider.getSigner();
    return await etherlime
        .ContractAt(InvestmentFactory, investmentFactoryContractAddress, signer, ethersProvider);
}

export const createUPortInvestmentFactory = async () => {
    return uPortConnect.contract(InvestmentFactory.abi).at(investmentFactoryContractAddress);
}