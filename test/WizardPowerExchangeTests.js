const etherlime = require('etherlime');
const ethers = require('ethers');
const WizardPowerExchange = require('../build/WizardPowerExchange.json');
const moment = require('moment');

let managerAccount = accounts[0];
let managerAccountSecretKey = accounts[0].secretKey;
let managerAccountAddress = accounts[0].signer.address;
let wizardPowerExchange;

const wizardForRegistrationId1 =  {
    wizardId: 1, 
    weiPerPowerPrice: 1000,
    wizardOwner: managerAccountAddress
};

const wizardForRegistrationId2 =  {
    wizardId: 2, 
    weiPerPowerPrice: 1000,
    wizardOwner: managerAccountAddress
};

const shouldRunWizardExchangeTests = true;
(shouldRunWizardExchangeTests ? describe : describe.skip)('Wizard Power Exchange Contract', () => {
    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(managerAccountSecretKey);
        provider = deployer.provider;
        managerWallet = new ethers.Wallet(managerAccountSecretKey, provider);
        wizardPowerExchange = await deployer.deploy(WizardPowerExchange);
    });
    
    it('should be a valid address', async() => {
        assert.isAddress(wizardPowerExchange.contractAddress, "The contract was not deployed");
    });

    it('should be a set manager address', async() => {
        const managerAddressFromContract = await wizardPowerExchange._manager();
        assert.equal(managerAddressFromContract, managerAccountAddress, "The manager account was not set");
    });

    it('should allow wizard to register for power exchange', async() => {
        //register wizard
        await wizardPowerExchange.registerWizard(wizardForRegistrationId1.wizardId, wizardForRegistrationId1.weiPerPowerPrice);

        console.log("registered wizard");

        var registeredWizards = await wizardPowerExchange.getAllRegisteredWizards();
        // console.log("all registered wizards",registeredWizards);

        assert.isNotEmpty(registeredWizards, "there should be one wizard registered");
        var registeredWizard = registeredWizards[0];
        // console.log(registeredWizard);
        assert.equal(registeredWizard.wizardId, wizardForRegistrationId1.wizardId, "the wizardId should be correct");
        assert.equal(registeredWizard.weiPerPowerPrice, wizardForRegistrationId1.weiPerPowerPrice, "the power price should be correct");
        assert.equal(registeredWizard.wizardOwner, wizardForRegistrationId1.wizardOwner, "the owner address should be correct");
        assert.equal(registeredWizard.registeredForPowerExchange, true, "wizard should be registered for power exchange");
    });

    it('should save the correct wizard index', async () => {
        var wizardIndex;
         //register wizard
         await wizardPowerExchange.registerWizard(wizardForRegistrationId1.wizardId, wizardForRegistrationId1.weiPerPowerPrice);

         wizardIndex = await wizardPowerExchange.getWizardIndexById(wizardForRegistrationId1.wizardId);
         assert.equal(wizardIndex, 0, "because there should only be one wizard and its index should be 0");

         //register wizard
         await wizardPowerExchange.registerWizard(wizardForRegistrationId2.wizardId, wizardForRegistrationId2.weiPerPowerPrice);

         wizardIndex = await wizardPowerExchange.getWizardIndexById(wizardForRegistrationId2.wizardId);
         assert.equal(wizardIndex, 1, "because there should now be two wizards and wizardForRegistrationId2 should have index of 1");
    })

    // it('should preserve the index of wizards when a wizard is unregistered', async () => {
    //      //register first wizard
    //      await wizardPowerExchange.registerWizard(wizardForRegistrationId1.wizardId, wizardForRegistrationId1.weiPerPowerPrice);

    //     //register second wizard
    //     await wizardPowerExchange.registerWizard(wizardForRegistrationId2.wizardId, wizardForRegistrationId2.weiPerPowerPrice);

    //      //unregister first wizard
    //      await wizardPowerExchange.unregisterWizard(wizardForRegistrationId1.wizardId);

    //      //assert that second wizard still have index of 1
    //      wizardIndex = await wizardPowerExchange.getWizardIndexById(wizardForRegistrationId2.wizardId);
    //      assert.equal(wizardIndex, 1, "because there should now be two wizards and wizardForRegistrationId2 should have index of 1");

    //      const wizardWithId2 = await wizardPowerExchange._wizardsRegistered(wizardIndex);
    //      console.log(wizardWithId2);
    //      assert.equal(wizardWithId2.wizardId, wizardForRegistrationId2.wizardId, "the wizardId should be correct");
    //      assert.equal(wizardWithId2.weiPerPowerPrice, wizardForRegistrationId2.weiPerPowerPrice, "the power price should be correct");
    //      assert.equal(wizardWithId2.wizardOwner, wizardForRegistrationId2.wizardOwner, "the owner address should be correct");
    // })


    it('should allow wizard to unregister from power exchange', async() => {
        //register wizard
        await wizardPowerExchange.registerWizard(wizardForRegistrationId1.wizardId, wizardForRegistrationId1.weiPerPowerPrice);

        console.log("registered wizard");
        //unregister wizard
        await wizardPowerExchange.unregisterWizard(wizardForRegistrationId1.wizardId);

        //retrieve wizard by id
        var wizardIndex = await wizardPowerExchange.getWizardIndexById(wizardForRegistrationId1.wizardId);
        var wizard = await wizardPowerExchange._wizardsRegistered(wizardIndex);

        assert.equal(wizard.registeredForPowerExchange, false, "wizard should be de-registered from power exchange");
    })

    it ('should not let duplicate wizard register for power exchange', async () => {
        //register first wizard
        await wizardPowerExchange.registerWizard(wizardForRegistrationId1.wizardId, wizardForRegistrationId1.weiPerPowerPrice);

        //register duplicate wizard
        console.log(await wizardPowerExchange.isDuplicateWizard(wizardForRegistrationId1.wizardId));

        await wizardPowerExchange.registerWizard(wizardForRegistrationId1.wizardId, wizardForRegistrationId1.weiPerPowerPrice);

        //assert that only one wizard was registered
        var registeredWizards = await wizardPowerExchange.getAllRegisteredWizards();

        assert.equal(registeredWizards.length, 1, "only one wizard should be registered");
    })

    it ('should update details when wizard is duplicate', async () => {
        //register first wizard
        await wizardPowerExchange.registerWizard(wizardForRegistrationId1.wizardId, wizardForRegistrationId1.weiPerPowerPrice);

        //unregister wizard
        await wizardPowerExchange.unregisterWizard(wizardForRegistrationId1.wizardId);

        //register duplicate wizard
        await wizardPowerExchange.registerWizard(wizardForRegistrationId1.wizardId, 25);

        //assert that only one wizard was registered
        var wizard = (await wizardPowerExchange.getAllRegisteredWizards())[0];

        assert.equal(wizard.weiPerPowerPrice, 25, "price for power should be updated");
        assert.equal(wizard.registeredForPowerExchange, true, "wizard should be re-registered for power exchange");
    })

    it('should revert when trying to unregister wizard that was never registered', async () => {
        await assert.revert(
            wizardPowerExchange.unregisterWizard(wizardForRegistrationId1.wizardId)
        );
    })

})