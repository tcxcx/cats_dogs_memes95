# £ack this file was originally copied from https://github.com/Cyfrin/foundry-erc20-f23/blob/main/Makefile
-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil 

all: clean remove install build test
# removed 'update' - DO NOT run update as the protocol does not function with openzeppelin v5. 

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

# Install modules
install :; forge install foundry-rs/forge-std@v1.9.1 --no-git --no-commit && \
	forge install https://github.com/erc6551/reference --no-git --no-commit && \
	forge install smartcontractkit/chainlink --no-git --no-commit && \
	forge install smartcontractkit/foundry-chainlink-toolkit --no-git --no-commit && \
	forge install smartcontractkit/chainlink-local --no-git --no-commit && \
	forge install smartcontractkit/ccip-starter-kit-foundry --no-git --no-commit && \
	forge install OpenZeppelin/openzeppelin-contracts@v4.9.6 --no-git --no-commit && \
	forge install OpenZeppelin/openzeppelin-contracts-upgradeable@v4.9.6 --no-git --no-commit

# Build
build:; forge build

test :; forge test 

snapshot :; forge snapshot

format :; forge fmt

anvil :; anvil --steps-tracing --block-time 1

###############################
# 		Deploy Commands  				#
###############################

ETH_SEPOLIA_TEST_ARGS := --fork-url $(SEPOLIA_RPC_URL) 
ETH_SEPOLIA_DEPLOY_ARGS := --rpc-url $(SEPOLIA_RPC_URL) --account dev_2 --sender ${WALLET_ADDRESS} --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv

OPT_SEPOLIA_TEST_ARGS := --fork-url $(OPT_SEPOLIA_RPC_URL) 
OPT_SEPOLIA_DEPLOY_ARGS := --rpc-url $(OPT_SEPOLIA_RPC_URL) --account dev_2 --sender ${WALLET_ADDRESS} --broadcast --verify --etherscan-api-key $(OPT_ETHERSCAN_API_KEY) -vvvv

testDeploy: 
	@forge script script/DeployGames.s.sol $(ETH_SEPOLIA_TEST_ARGS)
	@forge script script/DeployPlayers.s.sol $(ETH_SEPOLIA_TEST_ARGS)
	@forge script script/DeployPlayers.s.sol $(OPT_SEPOLIA_TEST_ARGS)

deploy:
	@forge script script/DeployGames.s.sol $(ETH_SEPOLIA_DEPLOY_ARGS)
	@forge script script/DeployPlayers.s.sol $(ETH_SEPOLIA_DEPLOY_ARGS)
	@forge script script/DeployPlayers.s.sol $(OPT_SEPOLIA_DEPLOY_ARGS)
