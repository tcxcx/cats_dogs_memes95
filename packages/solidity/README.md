[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/7Cedars/loyalty-program-contracts"> 
    <img src="public/iconLoyaltyProgram.svg" alt="Logo" width="200" height="200">
  </a>

<h3 align="center">Cats, Dogs & Memes </h3>

  <p align="center">
    A game ... 
    <br />
    <a href="https://github.com/7Cedars/loyalty-program-contracts"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <!--NB: TO DO --> 
    <a href="https://loyalty-program-psi.vercel.app">View Demo of a dApp interacting with the protocol.</a>
    ·
    <a href="https://github.com/7Cedars/loyalty-program-contracts/issues">Report Bug</a>
    ·
    <a href="https://github.com/7Cedars/loyalty-program-contracts/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>

- [About](#about)
  - [Contracts](#contracts)
  - [Diagram](#diagram)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quickstart](#quickstart)
- [Usage](#usage)
  - [Test](#test)
  - [Test coverage](#test-coverage)
  - [Build](#build)
  - [Deploy](#deploy)
  - [Live example](#live-example)
- [Known Issues](#known-issues)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
  
</details>

<!-- ABOUT  -->
## About

### Contracts
The contracts that make up the Loyalty protocol: 
 - `LoyaltyProgram.sol`: Mints loyalty points and loyalty cards, distributes points to cards and (de)selects external gift programs. 
 - `LoyaltyCard6551Account.sol`: a bespoke ERC6551 account implementation optimised for the use with ERC1155 tokens. It acts as loyalty card and collects loyalty points and vouchers.
 - `ILoyaltyGift.sol` and `LoyaltyGift.sol`: The interface and base implementation of an, ERC-1155 based, gift contract. Loyalty Gifts are external contracts, examples can be found in the dedicated repository for [gift contracts](https://github.com/7Cedars/loyalty-gifts-contracts). These contracts exchange loyalty points to  
   - either a boolean `true` result. This signals that requirements for the gift have been met and the vendor can give a gift to the customer. 
   - or a loyalty voucher. A semi-fungible token minted at an external gift contract that allows the exchange for a gift at a later stage. 

### Diagram
See the following schema for more detail: 
  <!-- <a href="https://github.com/7Cedars/loyalty-program-contracts/blob/master/public/PoCModularLoyaltyProgram.png"> (Export? )
    <img src="public/PoCModularLoyaltyProgram.png" alt="Schema Protocol" width="100%" height="100%">
  </a> -->

### Built With
- Solidity 0.8.19
- Foundry 0.2.0
- OpenZeppelin 5.0
- TokenBound omnichain ERC-6551
- Chainlink Direct Funded VRF 2.5


<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running do the following.

### Prerequisites

Foundry
  - Install following the directions at [getfoundry.sh](https://getfoundry.sh/).
  - You'll know you did it right if you can run `forge --version` and you see a response like `forge 0.2.0 (816e00b 2023-03-16T00:05:26.396218Z)`

A blockchain with an ERC-6551 registry (v.0.3.1) deployed at address 0x000000006551c19487814612e58FE06813775758. 
  - To check what chains have an ERC-6551 registry deployed, see [tokenbound.org](https://docs.tokenbound.org/contracts/deployments). 
  - To deploy yourself (or on a local chain) follow the steps at [tokenbound.org](https://docs.tokenbound.org/guides/deploy-registry).

### Quickstart
1. Clone the repo
    ```
    git clone https://github.com/7Cedars/loyalty-program-contracts.git
    ```
2. navigate to the folder
    ```
    cd loyalty-program-contracts
    ```
3. create a .env file and add the following:
     ```
     SELECTED_RPC_URL = <PATH_TO_RPC> 
     ```
   
  Where <PATH_TO_RPC> is the url to your rpc provider, for example: https://eth-sepolia.g.alchemy.com/v2/... or http://localhost:8545 for a local anvil chain. 

  Note that tests will not run on a chain that does not have an ERC-6551 registry deployed. Due to compiler conflicts, it is not possible to deterministically deploy the erc6511 registry inside the test suite itself.    

4. run make
    ```
    make
    ```

## Usage
### Test 
  ```sh
  $ forge test
   ```

### Test coverage
  ```sh
  forge coverage
  ```

and for coverage based testing: 
  ```sh
  forge coverage --report debug
  ```

### Build
  ```sh
   $ forge build
   ```

### Deploy
  ```sh
   $ forge script --fork-url <RPC_URL> script/DeployLoyaltyProgram.s.sol --broadcast
   ```
Where <RPC_URL> is the url to your rpc provider, for example: https://eth-sepolia.g.alchemy.com/v2/...  


<!-- USAGE EXAMPLES -->
### Live example
A front-end dApp demonstration of this web3 protocol has been deployed on vercel.com. 
Try it out at [https://loyalty-program-psi.vercel.app/](https://loyalty-program-psi.vercel.app/). 


<!-- KNOWN ISSUES -->
## Known Issues
This contract has not been audited. Do not deploy on anything else than a test chain. More specifically:
- Testing coverage is still low. Fuzz tests especially are still underdeveloped.   
- ERC-1155 and ERC-6551 combination ... WIP 
- Centralisation. Owner has core priviledges in a consumer program. 
- I use a simple self build onlyOwner() modifier, instead of OpenZeppelin's implemntation. Keep gas cost down. 
- Owner of a loyalty program is set at construction, cannot be changed later on. 


<!-- ROADMAP -->
## Roadmap

- [ ] 

See the [open issues](https://github.com/7Cedars/loyalty-program-contracts/issues) for a full list of proposed features (and known issues).


<!-- CONTRIBUTING -->
## Contributing
Contributions and suggestions are more than welcome. If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Thank you! 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


<!-- CONTACT -->
## Contact

Seven Cedars - [@7__Cedars](https://twitter.com/7__Cedars) - cedars7@proton.me

GitHub profile [https://github.com/7Cedars](https://github.com/7Cedars)


[issues-shield]: https://img.shields.io/github/issues/7Cedars/loyalty-program-contracts.svg?style=for-the-badge
[issues-url]: https://github.com/7Cedars/loyalty-program-contracts/issues/
[license-shield]: https://img.shields.io/github/license/7Cedars/loyalty-program-contracts.svg?style=for-the-badge
[license-url]: https://github.com/7Cedars/loyalty-program-contracts/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
<!-- See list of icons here: https://hendrasob.github.io/badges/ -->
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Tailwind-css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Redux]: https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white
[Redux-url]: https://redux.js.org/
