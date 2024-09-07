# £ack this file was originally copied from https://github.com/Cyfrin/foundry-erc20-f23/blob/main/Makefile
-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil 

all: clean remove install build
# removed 'update' - DO NOT run update as the protocol does not function with openzeppelin v5. 

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules 
#&& git add . 
#&& git commit -m "modules"

# Install modules
install :; forge install foundry-rs/forge-std@v1.9.1 --no-git --no-commit && \
	forge install https://github.com/erc6551/reference --no-git --no-commit && \
	forge install smartcontractkit/foundry-chainlink-toolkit --no-git --no-commit && \
	forge install smartcontractkit/chainlink-local --no-git --no-commit && \
	forge install smartcontractkit/ccip-starter-kit-foundry --no-git --no-commit && \
	forge install OpenZeppelin/openzeppelin-contracts@v4.9.6 --no-git --no-commit && \
	forge install OpenZeppelin/openzeppelin-contracts-upgradeable@v4.9.6 --no-git --no-commit

# install chainlink seperately, otherwise it triggers an update. 
# forge install smartcontractkit/chainlink --no-git --no-commit

# Build
build:; forge build

test :; forge test 

snapshot :; forge snapshot

format :; forge fmt

anvil :; anvil --steps-tracing --block-time 1

###############################
# 		  FORKED TESTS  				#
###############################
# Sepolia mainnet args # 
SEPOLIA_TEST_ARGS := --fork-url $(SEPOLIA_RPC_URL) 
SEPOLIA_DEPLOY_ARGS := --rpc-url $(SEPOLIA_RPC_URL) --account dev_2 --sender ${DEV2_ADDRESS} --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv
SEPOLIA_LIVE_ARGS := --rpc-url $(SEPOLIA_RPC_URL) --account dev_2 --sender ${DEV2_ADDRESS} --broadcast -vvvv
# Optimism sepolia args # 
OPT_SEPOLIA_TEST_ARGS := --fork-url $(OPT_SEPOLIA_RPC_URL) 
OPT_SEPOLIA_DEPLOY_ARGS := --rpc-url $(OPT_SEPOLIA_RPC_URL) --account dev_2 --sender ${DEV2_ADDRESS} --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv

sepoliaForkedTest: 
	@forge test $(SEPOLIA_TEST_ARGS)

sepoliaLiveForkedTest: 
	@forge script script/LiveInteractions.s.sol $(SEPOLIA_TEST_ARGS)

sepoliaLive: 
	@forge script script/LiveInteractions.s.sol $(SEPOLIA_LIVE_ARGS)

sepoliaVerifyAvatarBasedAccount:
	@forge verify-contract --guess-constructor-args --etherscan-api-key $(ETHERSCAN_API_KEY) --chain 11155111 --num-of-optimizations 200 --watch 0xC9c668345CC64A45083ae1AdAB5c6F65320D6543 src/AvatarBasedAccount.sol:IAvatarExecutable


sepoliaForkedDeployTest:
# @forge script script/DeployPlayers.s.sol $(SEPOLIA_TEST_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol:DeployGames $(SEPOLIA_TEST_ARGS) --gas-limit 500000000 --gas-price 5000000000 -vvvv 

sepoliaForkedDeploy: 
#	@forge script script/DeployPlayers.s.sol $(SEPOLIA_DEPLOY_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol $(SEPOLIA_DEPLOY_ARGS) --gas-limit 20000000 --gas-price 12000000000 -vvvv

###############################
#  Arbitrum Sepolia testnet		#
###############################
# Note: testing on Arbitrum does not work doe to a bug in foundry: https://github.com/foundry-rs/foundry/issues/7580. 
# You receive an "EvmError: InvalidFEOpcode" error. 
ARB_SEPOLIA_TEST_ARGS := --fork-url $(ARB_SEPOLIA_RPC_URL) 
ARB_SEPOLIA_DEPLOY_ARGS := --rpc-url $(ARB_SEPOLIA_RPC_URL) --account dev_2 --sender ${DEV2_ADDRESS} --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv

arbSepoliaForkedTest: 
	@forge test --no-match-contract Games_fuzz --mt testVRFReturnsWithRandomValue -vvvv $(ARB_SEPOLIA_TEST_ARGS) 
# 

arbSepoliaForkedDeployTest:
	@forge script script/DeployPlayers.s.sol:DeployPlayers $(ARB_SEPOLIA_TEST_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol:DeployGames $(ARB_SEPOLIA_TEST_ARGS) -vvvv 
	
arbSepoliaForkedDeploy: 
	@forge script script/DeployPlayers.s.sol:DeployPlayers $(SEPOLIA_DEPLOY_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol:DeployGames $(SEPOLIA_DEPLOY_ARGS) -vvvv 


###############################
#  Optimism Sepolia testnet		#
###############################
OPT_SEPOLIA_TEST_ARGS := --fork-url $(OPT_SEPOLIA_RPC_URL) 
OPT_SEPOLIA_DEPLOY_ARGS := --rpc-url $(OPT_SEPOLIA_RPC_URL) --account dev_2 --sender ${DEV2_ADDRESS} --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv

optSepoliaForkedTest: 
	@forge test $(OPT_SEPOLIA_TEST_ARGS)
# --no-match-contract Games_fuzz

optSepoliaForkedDeployTest:
	@forge script script/DeployPlayers.s.sol:DeployPlayers $(OPT_SEPOLIA_TEST_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol:DeployGames $(OPT_SEPOLIA_TEST_ARGS) -vvvv 
	
optSepoliaForkedDeploy: 
	@forge script script/DeployPlayers.s.sol:DeployPlayers $(OPT_SEPOLIA_DEPLOY_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol:DeployGames $(OPT_SEPOLIA_DEPLOY_ARGS) -vvvv 


###############################
#    Base Sepolia testnet		  #
###############################
BASE_SEPOLIA_TEST_ARGS := --fork-url $(BASE_SEPOLIA_RPC_URL) 
BASE_SEPOLIA_DEPLOY_ARGS := --rpc-url $(BASE_SEPOLIA_RPC_URL) --account dev_2 --sender ${DEV2_ADDRESS} --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv

baseSepoliaForkedTest: 
	@forge test --mt testPlayerCannotInitaliseGameIfDoesNotOwnACardInTheirDeck -vvvv $(BASE_SEPOLIA_TEST_ARGS)
# --no-match-contract Games_fuzz

baseSepoliaForkedDeployTest:
	@forge script script/DeployPlayers.s.sol $(BASE_SEPOLIA_TEST_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol $(BASE_SEPOLIA_TEST_ARGS) -vvvv 
	
baseSepoliaForkedDeploy: 
	@forge script script/DeployPlayers.s.sol $(BASE_SEPOLIA_DEPLOY_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol $(BASE_SEPOLIA_DEPLOY_ARGS) -vvvv 

###############################
#    Bug Fixing Deployment	  #
###############################
BASE_SEPOLIA_TEST_ARGS := --fork-url $(BASE_SEPOLIA_RPC_URL) 
BASE_SEPOLIA_DEPLOY_ARGS := --rpc-url $(BASE_SEPOLIA_RPC_URL) --account dev_2 --sender ${DEV2_ADDRESS} --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv

base2SepoliaForkedTest: 
	@forge test $(BASE_SEPOLIA_TEST_ARGS)
# --no-match-contract Games_fuzz

base2SepoliaForkedDeployGamesTest:
	@forge script script/DeployGames.s.sol $(BASE_SEPOLIA_TEST_ARGS) -vvvv 

base2SepoliaForkedGamesDeploy: 
	@forge script script/DeployGames.s.sol $(BASE_SEPOLIA_DEPLOY_ARGS) --gas-limit 20000000 --gas-price 12000000000 -vvvv 

baseSepoliaForkedDeployPlayersTest: 
	@forge script script/DeployPlayers.s.sol $(BASE_SEPOLIA_TEST_ARGS) -vvvv 

base2SepoliaForkedPlayersDeploy: 
	@forge script script/DeployPlayers.s.sol $(BASE_SEPOLIA_DEPLOY_ARGS) -vvvv 

resend: 
	cast send 


