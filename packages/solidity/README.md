![hero](image.png) 

<p align="center">
  
  <h1 align="center"><b>Cats, Dogs, Memes, etc: Solidity Protocol</b></h1>
<p align="center">
    <br />
    <br />
    <a href="#whats-included"><strong>What's included</strong></a> ·
    <a href="#prerequisites"><strong>Prerequisites</strong></a> ·
    <a href="#getting-started"><strong>Getting Started</strong></a> ·
  </p>
</p>

A protocol that combines Chainlink's direct funded VRF 2.5, automation v2.1 and CCIP in a Proof-of-Concept of omnichain gaming around tokenised, multi-chain, 'Avatar Based Accounts'. Avatar Based Accounts provide gated access at L2 (in this case we used optimism sepolia) to games deployed at L1s (in this case mainnet sepolia). 

This allows: 
- omnichain agents to be integrated with games building on mainnet services (such as chainlink VRF, stackr mirco rollups, etc). 
- multi-chain tokenised access to web3 games
- simplify the development of omnichain games by abstracting chain-interactions away from dApp to user accounts.  

## What's included

### Deployed @L1 mainnet sepolia: 

[Chainlink direct funded VRF v2.5](https://docs.chain.link/vrf/v2-5/overview/direct-funding) - randomisation of cards in card packs. <br>
[Chainlink Automation v2.1](https://docs.chain.link/chainlink-automation) - Automated ending of tournaments. <br>
[OpenZeppelin's ERC20](https://docs.openzeppelin.com/contracts/4.x/erc20) - Game meme coin.  <br>
[OpenZeppelin's ERC1155](https://docs.openzeppelin.com/contracts/4.x/erc1155) - cards and card distribution.<br>

### Deployed @L1 mainnet sepolia and @L2 optimism sepolia: 

[Chainlink CCIP](https://docs.chain.link/ccip) - Multichain ERC-6551 players. <br>
[Tokenbound's ERC-6551](https://docs.tokenbound.org/guides/deploy-account-implementation) - ERC-6551 'Avatar Based Accounts'.  <br>
[OpenZeppelin's ERC721](https://docs.openzeppelin.com/contracts/4.x/erc721) - Avatar NFT as basis for ERC-6551 'Avatar Based Accounts'. <br>

## Directory Structure

```
.
├── lib                                 # Installed dependencies. 
│    ├── ccip-starter-kit-foundry       # Supabase (API, Auth, Storage, Realtime, Edge Functions)
│    ├── chainlink                      # App - Cats, Dogs, Memes. etc UI
│    ├── chainlink-local                # Marketing site or Landing Page
│    └── ...
|
├── script                              # Deployment scripts
│    ├── DeployGames.s.sol              # Deploys Games.sol, Cards.sol, Coins.sol also uploads a test set of cards. 
│    ├── DeployPlayers.s.sol            # Deploys Players.sol and AvatarBasedAccounts.sol 
│    └── HelperConfig.s.sol        
|
├── src                                 # Protocol resources
│    ├── lib                            # Address of deployed contracts on L1 and L2. 
│    ├── metadata                       # Metadata of cards. 
│    ├── AvatarBasedAccount.sol         # ERC-6551 omni-chain token based account. Uses Chainlink's CCIP. 
│    ├── Cards.sol                      # ERC-1155 cards manager. Uses Chainlink's direct funded VRF 2.5.
│    ├── Coins.sol                      # ERC-20 memecoin minter and distributer. 
│    ├── Games.sol                      # Manages games and tournaments. Uses Chainlink automation. 
│    └── Players.sol                    # Creates ERC-6551 Avatar based accounts. Uses Chainlink's CCIP. 
|
├── test                                # Tests 
│    ├── fuzz                           # Fuzz tests
│         └── Games_fuzz.t.sol          # Fuzz test of games, card dispenser and tournament logic. 
│    ├── resources                      # Card metadata used in tests.  
│    └── unit                           # Unit tests
│         ├── AvatarBasedAccount.t.sol  
│         ├── Cards.t.sol               
│         ├── ChainlinkCCIP.t.sol       # Local test of Chainlink CCIP. Uses ccip-starter-kit-foundry. 
│         ├── ChainlinkVRF.t.sol        # Local test of chainlink VRF. 
│         └── ...               
|        
├── .env.example                   
├── foundry.toml                   
├── LICENSE
├── README.md
├── Makefile.md                         # Commands to deploy contracts on mainnet sepolia and optimism sepolia.  
├── remappings.txt
└── ...


```

## Prerequisites

Foundry<br>
Docker<br>

## Getting Started

1. Clone this repo locally and move to the solidity folder:

```sh
git clone https://github.com/tcxcx/cats_dogs_memes95
cd cats_dogs_memes95/packages/solidity 
```

2. Copy `.env.example` to `.env` and update the variables.

```sh
cp env.example .env
```

3. run make. This will install all dependencies and run the tests. 

```sh
make
```

4. Run the tests without installing packages: 

```sh
forge test 
```

## Checkout the deployed contracts:

[Cards.sol]() 0x37FD9cA01307708E29812621991eA7DF04e3E539 <br>
[Games.sol]() 0x0f0D9F12143eBCa798E3873CE5350eE71AcDC03b <br>
[Players.sol L1 & L2]() 0xb7dF35B05401e6d338832247C752dC298648Cc99 <br>
[AvatarBasedAccount.sol L1 & L2]() 0x8d59b934BEb304464E80c2F18693d5cf9dF627F6 <br>

## Checkout state change hashes:

```

Creation ERC6551 Avatar Based Account. 
└── 0x530928989346bb15caa5288ba2dcecb1cd351b20401a87a9e63b556ea386f11e

Random selection of cards in card pack (Chainlink VRF)
├── 0x0093e7dd5cbfba94853f0b8ce1b8bba94749ec22e7419e02674e58fba69aba9d
├── 0x2af50c254fab75eda05452e91507ab466958d7612bb94d321a6ff7d3a056d277                      
├── 0x8ae6a6430c6f9bc650ba0d171e15438daeff1253547b29bd75129b58e4fb3032
└── 0x52a1648d8a602441f2d22cbfc793bcf8619d5b215e776bf6421669844792c815  

CCIP, creation Multi-Chain ERC-6551 Avatar Based Account. Two examples. 
├── 0x3472bd377bf0d1b6d7fa5b4f2a082d5aba69772fb513020e9c979945bc0f0365
└── 0xb62a2b87c23964d751671a41de7d1fe12bebc30489c838bbc016df9deaf1d9d1                      

```




