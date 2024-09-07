pragma solidity ^0.8.19;

import {CCIPLocalSimulatorFork, Register} from "../../lib/chainlink-local/src/ccip/CCIPLocalSimulatorFork.sol";
import {Test, console, console2} from "@forge-std/Test.sol";
import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {Games} from "../../src/Games.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";
import {DeployGames} from "../../script/DeployGames.s.sol";

contract ChainlinkCCIPTest is Test {
    CCIPLocalSimulatorFork public ccipLocalSimulatorFork;
    uint256 ethSepoliaFork;
    uint256 optSepoliaFork;
    uint64 optSepoliaChainSelector; 
    Cards cards; 
    Games games; 
    Players ethPlayers; 
    Players optPlayers;
    AvatarBasedAccount ethABA; 
    AvatarBasedAccount optABA; 

    address avatarAccountAddress; 

    address userOne = makeAddr("UserOne");
    string avatarUri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";
    uint256 avatarId; 

    modifier createAvatarBasedAccount() { 
      // prep: set up a cross chain avatar based account.
      // step 1: reading the correct avatarId... 

      vm.selectFork(ethSepoliaFork);
      uint256 avatarCounter = ethPlayers.avatarCounter();  

      // step 2: initiate the creation of the cross chain avatar based account on optimism sepolia. 
      vm.selectFork(optSepoliaFork);
      vm.startPrank(userOne); 
      (, avatarAccountAddress) = optPlayers.createPlayer(avatarId);
      ccipLocalSimulatorFork.switchChainAndRouteMessage(ethSepoliaFork);
      vm.stopPrank(); 

      _; 
    }

    function setUp() public noGasMetering {
      vm.pauseGasMetering(); 

      console.log("gasleft 1", gasleft()); 
      string memory SEPOLIA_RPC_URL = vm.envString("SEPOLIA_RPC_URL");
      string memory OPT_SEPOLIA_RPC_URL = vm.envString("OPT_SEPOLIA_RPC_URL");
      ethSepoliaFork = vm.createSelectFork(SEPOLIA_RPC_URL);
      optSepoliaFork = vm.createFork(OPT_SEPOLIA_RPC_URL);

      ccipLocalSimulatorFork = new CCIPLocalSimulatorFork();
      vm.makePersistent(address(ccipLocalSimulatorFork));
      // Register.NetworkDetails 
      //   memory destinationNetworkDetails = ccipLocalSimulatorFork.getNetworkDetails(11155420); // optimism sepolia id = 11155420

      vm.selectFork(ethSepoliaFork); // deploy players on sepolia mainnet
      assert(block.chainid == 11155111); // check if correct chain is selected
      
      DeployGames deployerGames = new DeployGames();
      (cards, games, ) = deployerGames.run();
      DeployPlayers deployerEth = new DeployPlayers();
      (ethPlayers, ethABA, ) = deployerEth.run();
      
      vm.deal(0x000000006551c19487814612e58FE06813775758, 10 ether); //  
      vm.deal(address(ethPlayers), 10 ether); 
      vm.deal(address(ethABA), 10 ether);

      vm.selectFork(optSepoliaFork); // deploy players on optimism sepolia 
      assert(block.chainid == 11155420); // check if correct chain is selected

      DeployPlayers deployerOpt = new DeployPlayers();
      (optPlayers, optABA, ) = deployerOpt.run();
      vm.deal(0x000000006551c19487814612e58FE06813775758, 10 ether); 
      vm.deal(address(optPlayers), 10 ether); 
      vm.deal(address(optABA), 10 ether); 

      vm.prank(optPlayers.OWNER()); 
      optPlayers.setL1_playersAddress(address(ethPlayers)); 

      console.log("gasleft 2", gasleft());  

      assert(address(optPlayers) == address(ethPlayers)); 
      assert(address(ethABA) == address(optABA));
    }

    function testContractsHaveTheSameOwner() public {
      address ownerEthPlayers = ethPlayers.OWNER();
      address ownerOptPlayers = optPlayers.OWNER();

      assert(ownerOptPlayers == ownerEthPlayers); 
    }

    function testPlayerIsCreatedOnTwoChainsWithSameAddress() public {
      // note: We read the current counter for avatarIds from the Eth sepolia chain. 
      // this is because the state of the game is set at this chain.
      vm.selectFork(ethSepoliaFork);
      uint256 avatarCounter = ethPlayers.avatarCounter();  
    
      vm.selectFork(optSepoliaFork); // switch to the optimism fork to create a player on this chain.  
      vm.startPrank(userOne); 
      optPlayers.createPlayer(avatarId);
      ccipLocalSimulatorFork.switchChainAndRouteMessage(ethSepoliaFork);
      vm.stopPrank(); 

      // and lo and behold! We get an ERC-6551 avatar/token based account on optimism sepolia AND ethereum sepolia. 
      vm.selectFork(ethSepoliaFork); // 
      address ethAvatarBasedAddress = ethPlayers.getAvatarAddress(0);
      vm.selectFork(optSepoliaFork); // 
      address optAvatarBasedAddress = optPlayers.getAvatarAddress(0);

      assert(optAvatarBasedAddress == ethAvatarBasedAddress);
    }

    function testPlayerOnL2canOpenCardPackOnL1() public noGasMetering createAvatarBasedAccount  {
      console.log("gasleft 3", gasleft()); 

      // step 1: create call to draw cards at Cards.sol. 
      uint256 cardPackNumber = 1;
      uint256 priceCardPack = cards.PRICE_CARD_PACK();
      bytes memory callData = abi.encodeWithSelector(cards.openCardPack.selector, cardPackNumber);

      // step 2: execute call. 
      vm.selectFork(optSepoliaFork);
      vm.pauseGasMetering();
      // this hangs on a 'out of gas' message.. even though there is still gas. 
      // see similar bug reports at: https://github.com/foundry-rs/foundry/issues/3971
      vm.startPrank(userOne); 
      AvatarBasedAccount(payable(avatarAccountAddress)).ccipExecute(address(cards), priceCardPack, callData, 0);
      vm.stopPrank(); 

      console.log("gasleft 4", gasleft()); 

      // step 3: check if avatar based account received cards. 
      vm.selectFork(ethSepoliaFork);
      cards.getCollection(avatarAccountAddress);

    }
}