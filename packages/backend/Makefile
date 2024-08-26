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


