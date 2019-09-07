import etherlime from 'etherlime';
import InvestmentRanking from '../contracts/InvestmentRanking.json';
import Web3 from 'web3';
import { ethers } from 'ethers';
import uportConnect from './uPortConnect.js';
import {investmentRankingContractAddress, rinkebyProviderUrl} from '../configuration';

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

export const createInvestmentRanking = async () => {
    const signer = await ethersProvider.getSigner();
    return await etherlime
        .ContractAt(InvestmentRanking, investmentRankingContractAddress, signer, ethersProvider);
}

export const createUPortInvestmentRanking = async () => {
    return uportConnect.contract(InvestmentRanking.abi).at(investmentRankingContractAddress)
}

export default createInvestmentRanking;