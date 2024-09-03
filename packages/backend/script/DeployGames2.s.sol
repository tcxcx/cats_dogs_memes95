// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {Cards2} from "../src/Cards2.sol";
import {Games} from "../src/Games.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployGames2 is Script {
    Cards2 cards2;
    Games gamesContract;
    HelperConfig helperConfig; 
    uint256  cardPackPrice = 1 ether; 
    uint256[]  packThresholds = [5, 15, 30, 100]; 
    uint256[] packCoinAmounts = [500, 100, 25, 5]; 

    function run() external returns (Cards2, Games, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        
        (, address wrapperAddress, uint32 callbackGasLimit, uint16 requestConfirmations) =
            helperConfig.activeNetworkConfig();

        vm.startBroadcast();

        cards2 = new Cards2(
            cardPackPrice, 
            packThresholds, 
            packCoinAmounts, 
            callbackGasLimit, 
            requestConfirmations, 
            wrapperAddress
            );
        createCards(); // saves cards to blockchain

        gamesContract = new Games(
            address(cards2)  
        ); 

        vm.stopBroadcast();
        return (cards2, gamesContract, helperConfig); 
    }

    function createCards() public {
        string memory newuri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmPWxjBsLvVs7pMBDL6xssr71b3ynvkgDDZgpDA6hbZ4BM/{id}.json";  
        Cards2.Card[] memory CardData = new Cards2.Card[](60);

        CardData[0] = Cards2.Card({name: 'Ragamuffin' , cardType:'Cat'	, atk: 5	, hp: 4	, spd:5	, infRange:0	, supRange:93}); 
        CardData[1] = Cards2.Card({name: 'Burmese' , cardType:'Cat'	, atk: 6	, hp: 2	, spd:9	, infRange:93	, supRange:139}); 
        CardData[2] = Cards2.Card({name: 'Tonkinese' , cardType:'Cat'	, atk: 4	, hp: 7	, spd:4	, infRange:139	, supRange:170}); 
        CardData[3] = Cards2.Card({name: 'Siberian' , cardType:'Cat'	, atk: 8	, hp: 7	, spd:2	, infRange:170	, supRange:193}); 
        CardData[4] = Cards2.Card({name: 'Russian Blue' , cardType:'Cat'	, atk: 5	, hp: 6	, spd:4	, infRange:193	, supRange:212}); 
        CardData[5] = Cards2.Card({name: 'Norwegian Forest Cat' , cardType:'Cat'	, atk: 4	, hp: 5	, spd:6	, infRange:212	, supRange:227}); 
        CardData[6] = Cards2.Card({name: 'American Shorthair' , cardType:'Cat'	, atk: 3	, hp: 4	, spd:10	, infRange:227	, supRange:240}); 
        CardData[7] = Cards2.Card({name: 'Devon Rex' , cardType:'Cat'	, atk: 4	, hp: 3	, spd:10	, infRange:240	, supRange:252}); 
        CardData[8] = Cards2.Card({name: 'Oriental Shorthair' , cardType:'Cat'	, atk: 6	, hp: 7	, spd:3	, infRange:252	, supRange:262}); 
        CardData[9] = Cards2.Card({name: 'Birman' , cardType:'Cat'	, atk: 6	, hp: 3	, spd:7	, infRange:262	, supRange:271}); 
        CardData[10] = Cards2.Card({name: 'Bengal' , cardType:'Cat'	, atk: 6	, hp: 7	, spd:3	, infRange:271	, supRange:280}); 
        CardData[11] = Cards2.Card({name: 'Persian' , cardType:'Cat'	, atk: 3	, hp: 9	, spd:5	, infRange:280	, supRange:288}); 
        CardData[12] = Cards2.Card({name: 'Scottish Fold' , cardType:'Cat'	, atk: 5	, hp: 9	, spd:3	, infRange:288	, supRange:295}); 
        CardData[13] = Cards2.Card({name: 'Sphynx' , cardType:'Cat'	, atk: 5	, hp: 7	, spd:4	, infRange:295	, supRange:301}); 
        CardData[14] = Cards2.Card({name: 'Abyssinian' , cardType:'Cat'	, atk: 7	, hp: 10	, spd:2	, infRange:301	, supRange:307}); 
        CardData[15] = Cards2.Card({name: 'Siamese' , cardType:'Cat'	, atk: 10	, hp: 7	, spd:2	, infRange:307	, supRange:313}); 
        CardData[16] = Cards2.Card({name: 'British Shorthair' , cardType:'Cat'	, atk: 2	, hp: 10	, spd:7	, infRange:313	, supRange:319}); 
        CardData[17] = Cards2.Card({name: 'Maine Coon' , cardType:'Cat'	, atk: 3	, hp: 4	, spd:12	, infRange:319	, supRange:324}); 
        CardData[18] = Cards2.Card({name: 'Exotic Shorthair' , cardType:'Cat'	, atk: 8	, hp: 9	, spd:2	, infRange:324	, supRange:329}); 
        CardData[19] = Cards2.Card({name: 'Ragdoll' , cardType:'Cat'	, atk: 9	, hp: 2	, spd:9	, infRange:329	, supRange:333}); 
        CardData[20] = Cards2.Card({name: 'Pomeranian' , cardType:'Dog'	, atk: 13	, hp: 1	, spd:6	, infRange:333	, supRange:426}); 
        CardData[21] = Cards2.Card({name: 'Miniature Schnauzer' , cardType:'Dog'	, atk: 6	, hp: 7	, spd:2	, infRange:426	, supRange:472}); 
        CardData[22] = Cards2.Card({name: 'Cavalier King Charles Spaniel' , cardType:'Dog'	, atk: 1	, hp: 9	, spd:10	, infRange:472	, supRange:503}); 
        CardData[23] = Cards2.Card({name: 'Great Dane' , cardType:'Dog'	, atk: 5	, hp: 5	, spd:4	, infRange:503	, supRange:526}); 
        CardData[24] = Cards2.Card({name: 'Doberman Pinscher' , cardType:'Dog'	, atk: 5	, hp: 3	, spd:7	, infRange:526	, supRange:545}); 
        CardData[25] = Cards2.Card({name: 'Siberian Husky' , cardType:'Dog'	, atk: 7	, hp: 4	, spd:4	, infRange:545	, supRange:560}); 
        CardData[26] = Cards2.Card({name: 'Shih Tzu' , cardType:'Dog'	, atk: 7	, hp: 4	, spd:4	, infRange:560	, supRange:574}); 
        CardData[27] = Cards2.Card({name: 'Boxer' , cardType:'Dog'	, atk: 4	, hp: 7	, spd:4	, infRange:574	, supRange:585}); 
        CardData[28] = Cards2.Card({name: 'Yorkshire Terrier' , cardType:'Dog'	, atk: 4	, hp: 6	, spd:5	, infRange:585	, supRange:595}); 
        CardData[29] = Cards2.Card({name: 'Australian Shepherd' , cardType:'Dog'	, atk: 3	, hp: 5	, spd:8	, infRange:595	, supRange:605}); 
        CardData[30] = Cards2.Card({name: 'Pembroke Welsh Corgi' , cardType:'Dog'	, atk: 8	, hp: 5	, spd:3	, infRange:605	, supRange:613}); 
        CardData[31] = Cards2.Card({name: 'Dachshund' , cardType:'Dog'	, atk: 5	, hp: 8	, spd:3	, infRange:613	, supRange:621}); 
        CardData[32] = Cards2.Card({name: 'Rottweiler' , cardType:'Dog'	, atk: 10	, hp: 4	, spd:3	, infRange:621	, supRange:628}); 
        CardData[33] = Cards2.Card({name: 'Beagle' , cardType:'Dog'	, atk: 5	, hp: 5	, spd:5	, infRange:628	, supRange:635}); 
        CardData[34] = Cards2.Card({name: 'Bulldog' , cardType:'Dog'	, atk: 11	, hp: 4	, spd:3	, infRange:635	, supRange:641}); 
        CardData[35] = Cards2.Card({name: 'Poodle' , cardType:'Dog'	, atk: 9	, hp: 5	, spd:3	, infRange:641	, supRange:647}); 
        CardData[36] = Cards2.Card({name: 'German Shepherd' , cardType:'Dog'	, atk: 5	, hp: 4	, spd:7	, infRange:647	, supRange:652}); 
        CardData[37] = Cards2.Card({name: 'Golden Retriever' , cardType:'Dog'	, atk: 7	, hp: 2	, spd:10	, infRange:652	, supRange:657}); 
        CardData[38] = Cards2.Card({name: 'Chihuahua' , cardType:'Dog'	, atk: 2	, hp: 7	, spd:10	, infRange:657	, supRange:662}); 
        CardData[39] = Cards2.Card({name: 'Labrador Retriever' , cardType:'Dog'	, atk: 4	, hp: 9	, spd:4	, infRange:662	, supRange:667}); 
        CardData[40] = Cards2.Card({name: 'Baby Doge Coin' , cardType:'Meme'	, atk: 0	, hp: 10	, spd:10	, infRange:667	, supRange:759}); 
        CardData[41] = Cards2.Card({name: 'Maga' , cardType:'Meme'	, atk: 1	, hp: 1	, spd:1	, infRange:759	, supRange:806}); 
        CardData[42] = Cards2.Card({name: 'Gigachad' , cardType:'Meme'	, atk: 20	, hp: 2	, spd:2	, infRange:806	, supRange:837}); 
        CardData[43] = Cards2.Card({name: 'Ponke' , cardType:'Meme'	, atk: 9	, hp: 9	, spd:1	, infRange:837	, supRange:860}); 
        CardData[44] = Cards2.Card({name: 'Sundog' , cardType:'Meme'	, atk: 2	, hp: 11	, spd:4	, infRange:860	, supRange:878}); 
        CardData[45] = Cards2.Card({name: 'Turbo' , cardType:'Meme'	, atk: 9	, hp: 5	, spd:2	, infRange:878	, supRange:894}); 
        CardData[46] = Cards2.Card({name: 'Dog Runes' , cardType:'Meme'	, atk: 15	, hp: 2	, spd:3	, infRange:894	, supRange:907}); 
        CardData[47] = Cards2.Card({name: 'PepeCoin' , cardType:'Meme'	, atk: 4	, hp: 5	, spd:5	, infRange:907	, supRange:918}); 
        CardData[48] = Cards2.Card({name: 'Memecoin' , cardType:'Meme'	, atk: 3	, hp: 6	, spd:6	, infRange:918	, supRange:929}); 
        CardData[49] = Cards2.Card({name: 'Mog Coin' , cardType:'Meme'	, atk: 6	, hp: 6	, spd:3	, infRange:929	, supRange:938}); 
        CardData[50] = Cards2.Card({name: 'Cat In A Dogs World' , cardType:'Meme'	, atk: 6	, hp: 3	, spd:6	, infRange:938	, supRange:946}); 
        CardData[51] = Cards2.Card({name: 'Book Of Meme' , cardType:'Meme'	, atk: 8	, hp: 5	, spd:3	, infRange:946	, supRange:954}); 
        CardData[52] = Cards2.Card({name: 'Popcat' , cardType:'Meme'	, atk: 3	, hp: 8	, spd:5	, infRange:954	, supRange:961}); 
        CardData[53] = Cards2.Card({name: 'Brett' , cardType:'Meme'	, atk: 3	, hp: 10	, spd:4	, infRange:961	, supRange:968}); 
        CardData[54] = Cards2.Card({name: 'Floki' , cardType:'Meme'	, atk: 8	, hp: 2	, spd:8	, infRange:968	, supRange:974}); 
        CardData[55] = Cards2.Card({name: 'Bonk' , cardType:'Meme'	, atk: 5	, hp: 9	, spd:3	, infRange:974	, supRange:980}); 
        CardData[56] = Cards2.Card({name: 'Dog Wif Hat' , cardType:'Meme'	, atk: 4	, hp: 6	, spd:6	, infRange:980	, supRange:985}); 
        CardData[57] = Cards2.Card({name: 'Pepe' , cardType:'Meme'	, atk: 8	, hp: 9	, spd:2	, infRange:985	, supRange:990}); 
        CardData[58] = Cards2.Card({name: 'Shiba Inu' , cardType:'Meme'	, atk: 8	, hp: 9	, spd:2	, infRange:990	, supRange:995}); 
        CardData[59] = Cards2.Card({name: 'Dogecoin' , cardType:'Meme'	, atk: 3	, hp: 7	, spd:7	, infRange:995	, supRange:1000}); 

        // £message: We still have to decide on rarity of cards
        uint256[] memory mintAmounts = new uint256[](60); 
        for (uint256 i; i < 60; i++) { 
        mintAmounts[i] = 25 + (i * 2); 
        }  

    cards2.createCards(CardData, mintAmounts, newuri);
  }
}
