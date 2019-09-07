import etherlime from 'etherlime';
import Investment from '../contracts/Investment.json';
import Web3 from 'web3';
import uPortConnect from './uPortConnect';
import { ethers } from 'ethers';

let ethersProvider;

export const createInvestment = async (contractAddress) => {
    //running in the browser & metamask is available
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined'){
        ethersProvider = new ethers.providers.Web3Provider(window.web3.currentProvider);
    }
    //running on server *OR* user is not running metamask
    else{
        const provider = new Web3.providers.HttpProvider(
            'https://rinkeby.infura.io/jkWNMTe51IxgXBcG9G4i'
        );
        ethersProvider = new ethers.providers.Web3Provider(provider);
    }

    const signer = await ethersProvider.getSigner();
    return await etherlime
        .ContractAt(Investment, contractAddress, signer, ethersProvider);
}

export const createUPortInvestment = async (contractAddress) => {
    return uPortConnect.contract(Investment.abi).at(contractAddress);
}