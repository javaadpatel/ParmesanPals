import moment from 'moment';
import { ethers } from 'ethers';
import _ from 'lodash';
import {createInvestmentFactory as createInvestmentFactoryInstance, 
    createUPortInvestmentFactory} from '../investmentFactory';
import {createInvestment as createInvestmentInstance,
    createUPortInvestment
 } from  '../investment';
import {InvestmentStatusEnum, convertInvestmentStatusIntToConstant,
    convertInvestmentTransferStatusIntToConstant} from '../../constants';

const createInvestmentObject = (investmentArray) => {
  var investmentObject = {}
  investmentObject.address = investmentArray[0];
  investmentObject.managerAddress = investmentArray[1];
  investmentObject.totalInvestmentCost = ethers.utils.formatEther(investmentArray[2]);
  investmentObject.investmentTitle = investmentArray[3];
  investmentObject.investmentRationale = investmentArray[4];
  investmentObject.createdAt =  moment(investmentArray[5].toNumber()*1000).format('L'); 
  investmentObject.investmentDeadlineTimestamp = moment(investmentArray[6].toNumber()*1000).format('D/MM/YY');
  investmentObject.investmentStatus = convertInvestmentStatusIntToConstant(investmentArray[7]);
  investmentObject.commissionFee = investmentArray[8].toNumber();
  investmentObject.totalInvestmentContributed = ethers.utils.formatEther(investmentArray[9]);
  investmentObject.investorCount = investmentArray[10];
  investmentObject.investmentTransferStatus = convertInvestmentTransferStatusIntToConstant(investmentArray[11]);
  investmentObject.managerRanking = investmentArray[12];
  return investmentObject;
}

const createInvestmentContributionSummaryObject = (contractAddress, contributionArray) => {
    var contributionObject = {};
    contributionObject.investmentContractAddress = contractAddress;
    contributionObject.amountContributedInEth = ethers.utils.formatEther(contributionArray[0]);
    contributionObject.percentageShare = (contributionArray[1].div(100000)).toNumber();
    return contributionObject;
}

const checkFailedInvestment = async (investment, investmentObject) => {
    //check if the contract is still INPROGRESS
    if (investmentObject.investmentStatus === InvestmentStatusEnum.INPROGRESS){
        //check if the date now is after the investement is supposed to have expired
        if (moment().isAfter(moment(investmentObject.investmentDeadlineTimestamp, 'D/MM/YY'))){
            //await investment.checkContractStatus();
            // await investment.verboseWaitForTransaction(statussTxn);

            //hack, set status to FAILED, otherwise user will have to initiate transaction
            investmentObject.investmentStatus = InvestmentStatusEnum.FAILED;

            // await investment.verboseWaitForTransaction(statusTxn);
            // investmentObject = await fetchInvestmentFromContract(investmentObject.address);
        }
    }

    return investmentObject;
}


const createPaymentObjectsArray = (rawPayments) =>{
    var payments = rawPayments
        .map((payment) => payment.splice(-3,3))
        .map((payment) => { 
            var paymentObject = {};
            paymentObject.timestamp =  moment.unix(payment[0].toNumber()).format('LLLL');
            paymentObject.amountInEther =   ethers.utils.formatEther(payment[1]);
            paymentObject.address =   payment[2];
            return paymentObject;
    })
    return payments;
}

export const createInvestmentFromContract = async (managerAddress, formValues) => {
    const investmentFactoryInstance = await createInvestmentFactoryInstance(); //Need to extract this into another file
    //get current blockchain timestamp
    const currentGanacheUnixTimestamp = (await investmentFactoryInstance.getBlockTimestamp()).toNumber();
    const investmentDeadlineUnixTimestamp = moment.unix(currentGanacheUnixTimestamp).add(formValues.deadline, 'd').endOf('day').unix();
    const createdAt = currentGanacheUnixTimestamp;

    /*Create Investment using UPort*/
    (await createUPortInvestmentFactory())
        .createInvestment(
                managerAddress,
                ethers.utils.parseEther(formValues.totalInvestmentCost),
                formValues.title,
                formValues.rationale,
                createdAt,
                investmentDeadlineUnixTimestamp,
                formValues.commissionFee,
            'createInvestmentReq');

    /*Create Investment through metaMask*/
    // const createInvesmentTxn = await investmentFactoryInstance
    //     .createInvestment(
    //         managerAddress,
    //         ethers.utils.parseEther(formValues.totalInvestmentCost),
    //         formValues.title,
    //         formValues.rationale,
    //         createdAt,
    //         investmentDeadlineUnixTimestamp,
    //         formValues.commissionFee
    //     );
    // console.log("investmentTransaction-Metamask:", createInvesmentTxn);
    // await investmentFactoryInstance.verboseWaitForTransaction(createInvesmentTxn);

    //get investment addresses
    var investmentAddresses = await investmentFactoryInstance.getDeployedInvestments();

    //last address will be the one that was just created
    var investmentAddress = _.last(investmentAddresses);
    var investment = await createInvestmentInstance(investmentAddress);
    var investmentDetails = await investment.getInvestmentSummary();
    investmentDetails.unshift(investmentAddress);
    return createInvestmentObject(investmentDetails);
}

export const fetchInvestmentsFromContract = async () => {
    const investments = [];
    const investmentFactoryInstance = await createInvestmentFactoryInstance(); //Need to extract this into another file

    var investmentAddresses = await investmentFactoryInstance.getDeployedInvestments();
    await Promise.all(investmentAddresses.map(async (address) => {
        var investment = await createInvestmentInstance(address);
        var investmentDetails = await investment.getInvestmentSummary();
        //add address property to array
        investmentDetails.unshift(address);

        //create investmentObject
        var investmentObject = createInvestmentObject(investmentDetails);

        //check investmentStatus to determine if investment is failed
        investmentObject = await checkFailedInvestment(investment, investmentObject);
        
        //convert array to object
        investments.push(investmentObject);
    }));

    return investments;
}

export const fetchInvestmentFromContract = async (address) => {
    var investment = await createInvestmentInstance(address);
    var investmentDetails = await investment.getInvestmentSummary();
    //add address property to array
    investmentDetails.unshift(address);
        
    //convert array to object
    var investmentObject = createInvestmentObject(investmentDetails);

     //check investmentStatus to determine if investment is failed
     investmentObject = await checkFailedInvestment(investment, investmentObject);

     return investmentObject;
}

export const investToContract = async (contractAddress, investmentInEther) => {
    var investmentInstance = await createInvestmentInstance(contractAddress);
    var investTxn = await investmentInstance.invest({value: ethers.utils.parseEther(investmentInEther)});
    await investmentInstance.verboseWaitForTransaction(investTxn);
}

export const withdrawInvestmentFromContract = async (address) => {
    var investmentInstance = await createInvestmentInstance(address);
    var withdrawalTxn = await investmentInstance.withdrawInvestment();
    await investmentInstance.verboseWaitForTransaction(withdrawalTxn);
}

export const fetchInvestmentContributionSummaryFromContract = async (address) => {
    var investmentInstance = await createInvestmentInstance(address);
    var investmentContributionSummaryArray = await investmentInstance.getInvestmentContributionSummary();
    //convert array to object
    var investmentContributionSummaryObject = createInvestmentContributionSummaryObject(address, investmentContributionSummaryArray);
    return investmentContributionSummaryObject;
}

export const getPaymentsFromContract = async (contractAddress) => {
    var investmentInstance = await createInvestmentInstance(contractAddress);
    var paymentsArray = await investmentInstance.getAllPaymentRecords();
    var paymentsObjectArray = createPaymentObjectsArray(paymentsArray);

    //create payment object which has the contractAddress as a key and the array of payments as a value
    var paymentObject = {};
    paymentObject[contractAddress] = paymentsObjectArray;

    return paymentObject;
}

export const makePaymentToContract = async (contractAddress, paymentInWei) => {
    var investmentInstance = await createInvestmentInstance(contractAddress);
    var paymentTxn = await investmentInstance.pay({value: ethers.utils.parseEther(paymentInWei)});
    await investmentInstance.verboseWaitForTransaction(paymentTxn);
}

export const withdrawPaymentsFromContract = async (contractAddress) => {
    var investmentInstance = await createInvestmentInstance(contractAddress);
    var paymentWithdrawalTxn = await investmentInstance.withdrawPayments();
    await investmentInstance.verboseWaitForTransaction(paymentWithdrawalTxn);
}

export const extractInvestmentsFromContract = async (contractAddress) => {
    var investmentInstance = await createInvestmentInstance(contractAddress);
    var extractInvestmentsTxn = await investmentInstance.transferInvestmentContributions();
    await investmentInstance.verboseWaitForTransaction(extractInvestmentsTxn);
}

export const extractInvestmentsFromContract_uPort = async (contractAddress) => {
    (await createUPortInvestment(contractAddress))
        .transferInvestmentContributions(
            'extractInvestmentsReq');
}
