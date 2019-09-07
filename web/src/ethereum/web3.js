import Web3 from 'web3';
import { ethers } from 'ethers';
import {rinkebyProviderUrl} from '../configuration';


let ethersProvider;

//running in the browser & metamask is available
if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined'){
    // web3 = new Web3(window.web3.currentProvider);
    ethersProvider = new ethers.providers.Web3Provider(window.web3.currentProvider);
}
//running on server *OR* user is not running metamask
else{
    const provider = new Web3.providers.HttpProvider(
        rinkebyProviderUrl
    );
    ethersProvider = new ethers.providers.Web3Provider(provider);
}

export default ethersProvider;