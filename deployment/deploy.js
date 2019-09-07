const etherlime = require('etherlime');
const InvestmentFactory = require('../build/InvestmentFactory.json');
const InvestmentRanking = require('../build/InvestmentRanking.json');
require('dotenv').config();

const defaultConfigs = {
	gasPrice: 20000000000,
	gasLimit: 4700000,
	chainId: 0 // Suitable for deploying on private networks like Quorum
}

const deploy = async (network, secret) => {
	/*Etherlime Ganache Deployer*/
	// const deployer = new etherlime.EtherlimeGanacheDeployer();
	// const contract = await deployer.deploy(InvestmentFactory);

	/*Etherlime Infura Deployer*/
	const deployer = new etherlime.InfuraPrivateKeyDeployer(
		process.env.DEPLOYMENT_WALLET_PRIVATEKEY,
		process.env.DEPLOYMENT_NETWORK,
		process.env.DEPLOYMENT_INFURA_PRIVATEKEY,
		defaultConfigs
	);
	const investmentRankingInstance = await deployer.deploy(InvestmentRanking);
	const investmentFactoryInstance = await deployer.deploy(InvestmentFactory, false, investmentRankingInstance.contractAddress);
};

module.exports = {
	deploy
};