# Project Pegasus
Investment platform created using Ethereum technologies.

# Development

The project uses [Etherlime](https://etherlime.gitbook.io/etherlime/ "Etherlime's Documentation") for convience in interacting with the Ethereum blockchain. In order to run the project, install all npm dependencies and populate the settings of the two configuration files:  
- **.env.example** - holds values relating to deployment of smart contracts
- **index.configuration.js** - holds values for interacting with smart contracts 

### Application Architecture


### Testing
The tests are split into three sections (describe blocks):

- Investment Contract tests - These test functions on the **InvestmentFactory.sol** contract
- Investment Ranking Contract tests - These test functions on the **InvestmentRanking.sol** contract
- Time-Travel tests - These mainly test functions on the Investment Contract and are used to simulate a certain amount of time having passed (to replicate expiry of an investment deadline)

The tests can be run by first starting an etherlime ganache instance using
```
etherlime ganache
```
and then running the tests using
```
etherlime test
```

> NB. The time travel tests should are by turned off by default via the flag **shouldRunTimeTravelTests** as after too many executions they advance the ganache instance too far into the future and it crashes with a 'Invalid Block Time' error. This can probably be fixed by using the snapshot and reset features of Etherlime in future. 

### Deployment
The contracts can be deployed using 
```
etherlime deploy
```
This will output the contract addresses which need to be inserted into **index.configuration.js** 

### Launching
The application can be run by using the command
```
yarn start
```



# Contribution

PR's are more than welcome.
