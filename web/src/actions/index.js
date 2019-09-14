import {
    FETCH_WIZARDS_LOADING,
    FETCH_WIZARDS_SUCCESS,
    FETCH_WIZARDS_ERROR,
    FETCH_ETH_PROVIDER_SUCCESS,
    FETCH_ETH_PROVIDER_ERROR,
    CREATE_WIZARD_SUCCESS,
    CREATE_WIZARD_ERROR,
    REGISTER_WIZARD,
    FETCH_REGISTERED_WIZARDS
} from './types';
import {etherScanApiKey} from '../configuration';
import Axios from 'axios';

import { createGateKeeper, createWizardPowerExchange } from '../ethereum/gateKeeperFactory';
import { ethers } from 'ethers';
import _ from 'lodash';

const performAction = async (actionType, actionFunc, dispatch) => {
    try{
        console.log("sending request")
        dispatch({
            type: `${actionType}_REQUEST`
        });

        await actionFunc();
    
        dispatch({
            type: `${actionType}_SUCCESS`
        });
    }catch(err){
        dispatch({
            type: `${actionType}_FAILURE`,
            payload: {message: err.message}
        })
    }
}

export const etherScanStatusChecker = (txnHash, funcToDispatch, parameterForDispatch) => async (dispatch) => {
    var timesCalledApi = 0;
    var maxCallsAllowed = 30; //corresponds to 10 minutes
    var etherScanStatusInterval = setInterval(async function (){
        timesCalledApi++;
        console.log(timesCalledApi);
        //call etherscan api
        var transactionStatus = await callEtherScanApi(txnHash);
        /*If the transaction is completed it will have a status of 1*/
        if (transactionStatus === 1 || transactionStatus === "1" || transactionStatus === "error" || timesCalledApi >= maxCallsAllowed){
            clearInterval(etherScanStatusInterval);
            //dispatch some event
            if(funcToDispatch)
            {
                if (parameterForDispatch){
                    dispatch(funcToDispatch(parameterForDispatch));
                }else{
                    dispatch(funcToDispatch());
                }
            }
        }
    }, 20000);
}

const callEtherScanApi = async (txnHash) => {
    try {
        const res = await fetch(`https://api-ropsten.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txnHash}&apikey=${etherScanApiKey}`);
        const blocks = await res.json();
        const transactionStatus = blocks.result.status;
        return transactionStatus;
   } catch (e) {
       return "error";
   }
 }

 const createWizardsObjectArray = (rawPayments) =>{
  var registeredWizards = rawPayments
      .map((payment) => payment.splice(-4,4))
      .map((wizard) => { 
         console.log(wizard);
          var registeredWizardObject = {};
          registeredWizardObject.wizardId =  wizard[0].toNumber();
          registeredWizardObject.pricePerPowerInEther = ethers.utils.formatEther(wizard[1]);
          registeredWizardObject.ownerAddress =   wizard[2];
          registeredWizardObject.isRegistered =   wizard[3];
          return registeredWizardObject;
  })
  return registeredWizards;
}


export const getWizardsByOwner = (ownerAddress) => async dispatch => {
  dispatch({ type: FETCH_WIZARDS_LOADING });

  //retrieve all registered wizards
  const registeredWizards = await (await createWizardPowerExchange()).getAllRegisteredWizards();
  console.log(registeredWizards);

  const registeredWizardsObject = _.mapKeys(createWizardsObjectArray(registeredWizards), 'wizardId');
  console.log(registeredWizardsObject);
  
  // console.log(await wizardPowerExchange.isWizardRegistered(1002))
  Axios.get('https://cheezewizards-rinkeby.alchemyapi.io/wizards?owner=' + ownerAddress, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-token': '8s53vwYc-Kraljslq-ppV5EbQwq_bYcUWB0jmEXE',
      'x-email': 'eemandien@gmail.com'
    },
  }).then(response => {
    var wizards = response.data.wizards;
    //loop through wizards and get whether the wizard is registered `registeredForPowerExchange`
    var enrichedWizards = wizards.map((wizard) => {
      if(registeredWizardsObject[wizard.id] === undefined){
        wizard.isRegistered = false;
      } else{
        wizard.isRegistered = registeredWizardsObject[wizard.id].isRegistered;
      }
      return wizard;
    });

    dispatch({
      type: FETCH_WIZARDS_SUCCESS,
      // payload: { ownedWizards: response.data.wizards }
      payload: { ownedWizards: enrichedWizards }
    });
  }).catch(err => {
    dispatch({
      type: FETCH_WIZARDS_ERROR,
      payload: { error: true }
    });
  });
}

export const registerOnEthProviderUpdate = () => dispatch => {
  if(window.web3) {
    const publicConfigStore = window.web3.currentProvider.publicConfigStore;
        
    dispatch({
      type: FETCH_ETH_PROVIDER_SUCCESS,
      payload: {
        selectedAddress: publicConfigStore._state.selectedAddress,
        networkVersion: publicConfigStore._state.networkVersion
      }
    });

    window.web3.currentProvider.publicConfigStore.on('update', (config) => {
      dispatch({
        type: FETCH_ETH_PROVIDER_SUCCESS,
        payload: {
          selectedAddress: config.selectedAddress,
          networkVersion: config.networkVersion
        }
      });
    });
  } else {
    dispatch({
      type: FETCH_ETH_PROVIDER_ERROR,
      payload: { error: true }
    });
  }
}

export const createWizard = () => async dispatch => {
  try {
    const gateKeeper = await createGateKeeper();
    const txn = await gateKeeper.conjureWizard(3, { value: ethers.utils.parseEther('0.1') });
    await gateKeeper.verboseWaitForTransaction(txn, '');
    dispatch({
      type: CREATE_WIZARD_SUCCESS,
      payload: { }
    });
  } catch (err) {
    console.log('dispatching', err)
    dispatch({
      type: CREATE_WIZARD_ERROR,
      payload: { }
    });
  }
}

export const isWizardRegistered = (wizardId) => async dispatch => {
  const wizardPowerExchange = await createWizardPowerExchange();
  const registeredWizards = await wizardPowerExchange.isWizardRegistered(wizardId);
  console.log(registeredWizards);
}

export const registerWizard = (formValues, wizardId) => async dispatch => {
  console.log("registering wizard", wizardId);
  console.log(formValues);

  await performAction(REGISTER_WIZARD, async () => {
    //register wizard in investment
    const wizardPowerExchange = await createWizardPowerExchange();
    await wizardPowerExchange.registerWizard(wizardId, ethers.utils.parseEther(formValues.amount));

    console.log("registered wizard");

    dispatch({
            type: REGISTER_WIZARD,
            payload: null
        })
}, dispatch);
}
