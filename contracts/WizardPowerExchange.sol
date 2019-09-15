pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract WizardPowerExchange {

    address public _manager;
    struct RegisteredWizard {
        uint256 wizardId;
        uint256 weiPerPowerPrice;
        address wizardOwner;
        bool registeredForPowerExchange;
    }
    //array of all wizards registered for power exchange
    RegisteredWizard[] public _wizardsRegistered;
    //mapping of registeredWizardId to array index
    mapping(uint=>uint) _indexOfWizard;

    constructor() public{
        //set the manager of this contract = deployer account
        _manager = msg.sender;
    }

    function isDuplicateWizard (uint256 wizardId) public view returns (bool){
        //duplicates can only occur when there are wizards registered
        if (_wizardsRegistered.length >= 1){

            uint index = _indexOfWizard[wizardId];
            //we found a wizard index, therefore a wizard with this id must have already been registered
            if (index > 0){
                return true;
            }

            //this means the wizard is the first wizard registered or that the mapping defaulted
            if (index == 0) { 
                //check if its the first wizard registered
                return  _wizardsRegistered[index].wizardId == wizardId;
            }
        }

        return false;
    }

    function registerWizard(uint256 wizardId, uint256 weiPerPowerPrice) external {
        //check that wizard belongs to sender address (ommitted for now)

        //check for duplicate registration
        if(isDuplicateWizard(wizardId)){
            //update price per power and registration flag
            uint256 index = getWizardIndexById(wizardId);
            _wizardsRegistered[index].weiPerPowerPrice = weiPerPowerPrice;
            _wizardsRegistered[index].registeredForPowerExchange = true;
            return;
        }

        //create registeredWizard struct
        RegisteredWizard memory wizard = RegisteredWizard(wizardId, weiPerPowerPrice, msg.sender, true);

        //determine index of registered wizard
        uint wizardIndex = _wizardsRegistered.length;
        //register wizardId into mapping
        _indexOfWizard[wizardId] = wizardIndex;

        _wizardsRegistered.push(wizard);
    }

    function unregisterWizard(uint256 wizardId) external {
        //wizard should be a duplicate because this means that its already been registered, can't unregister a wizard that was never registered
        require(isDuplicateWizard(wizardId), "wizard needs to be registered");


        //find registered wizard and remove from _registeredWizards
        removeRegisteredWizard(wizardId);
    }

    function removeRegisteredWizard(uint256 wizardToUnregister) internal {
        uint index = _indexOfWizard[wizardToUnregister];

        //unregister the wizard
        _wizardsRegistered[index].registeredForPowerExchange = false;
    }

    function getAllRegisteredWizards() public view returns(RegisteredWizard[] memory){
        return _wizardsRegistered;
    }

    function getWizardIndexById(uint256 wizardId) public view returns (uint256) {
        return _indexOfWizard[wizardId];
    }

    function isWizardRegistered(uint256 wizardId) public view returns (bool) {
        bool isDuplicate = isDuplicateWizard(wizardId);

        //wizard has not been registered yet
        if (!isDuplicate)
            return false;
        
        //get wizard by index
        uint index = _indexOfWizard[wizardId];
        return _wizardsRegistered[index].registeredForPowerExchange;
    }

}