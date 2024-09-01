# £ack this file was originally copied from https://github.com/Cyfrin/foundry-erc20-f23/blob/main/Makefile
-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil 

all: clean remove install build
# removed 'update'

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules 
#&& git add . 
#&& git commit -m "modules"

# Install modules
install :; forge install foundry-rs/forge-std@v1.9.1 --no-commit && \
	forge install OpenZeppelin/openzeppelin-contracts@v4.9.6 --no-commit && \
	forge install OpenZeppelin/openzeppelin-contracts-upgradeable@v4.9.6 --no-commit && \
	forge install https://github.com/erc6551/reference --no-commit

# Update Dependencies
# update:; forge update

# Build
build:; forge build

test :; forge test 

snapshot :; forge snapshot

format :; forge fmt

anvil :; anvil --steps-tracing --block-time 1

###############################
# 		  Sepolia testnet				#
###############################
SEPOLIA_TEST_ARGS := --fork-url $(SEPOLIA_RPC_URL) 
SEPOLIA_DEPLOY_ARGS := --rpc-url $(SEPOLIA_RPC_URL) --account dev_2 --sender ${DEV2_ADDRESS} --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv

sepoliaForkedTest: 
	@forge test --no-match-contract Games_fuzz --mt testVRFReturnsWithRandomValue -vvvv $(SEPOLIA_TEST_ARGS)

sepoliaForkedDeployTest:
	@forge script script/DeployPlayers.s.sol:DeployPlayers $(SEPOLIA_TEST_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol:DeployGames $(SEPOLIA_TEST_ARGS) -vvvv 
	
sepoliaForkedDeploy: 
	@forge script script/DeployPlayers.s.sol:DeployPlayers $(SEPOLIA_DEPLOY_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol:DeployGames $(SEPOLIA_DEPLOY_ARGS) -vvvv 


###############################
#  Arbitrum Sepolia testnet		#
###############################
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
	@forge test --no-match-contract Games_fuzz --mt testVRFReturnsWithRandomValue -vvvv $(OPT_SEPOLIA_TEST_ARGS) 
# 

optSepoliaForkedDeployTest:
	@forge script script/DeployPlayers.s.sol:DeployPlayers $(OPT_SEPOLIA_TEST_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol:DeployGames $(OPT_SEPOLIA_TEST_ARGS) -vvvv 
	
optSepoliaForkedDeploy: 
	@forge script script/DeployPlayers.s.sol:DeployPlayers $(OPT_SEPOLIA_DEPLOY_ARGS) -vvvv 
	@forge script script/DeployGames.s.sol:DeployGames $(OPT_SEPOLIA_DEPLOY_ARGS) -vvvv 
