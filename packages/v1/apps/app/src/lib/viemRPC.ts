import {
  createWalletClient,
  createPublicClient,
  custom,
  formatEther,
  parseEther,
  type Chain,
  type TransactionReceipt,
  decodeEventLog,
  type Account,
  IntegerOutOfRangeError,
  toBytes,
} from "viem";
import { mainnet, polygonAmoy, sepolia } from "viem/chains";
import type { IProvider } from "@web3auth/base";
import { TypedDataField } from "ethers";
import { ActionSchema, AllowedInputTypes } from "@stackr/sdk";
import { TypedDataDomain, encodeFunctionData } from "viem";
import { Domain, Schema } from "@/app/api/rollup/types";
import playersABI from "./abis/Players.json";

export type EIP712Types = Record<string, TypedDataField[]>;

export default class EthereumRpc {
  private provider: IProvider;

  private contractABI = [
    {
      inputs: [],
      name: "retrieve",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "num",
          type: "uint256",
        },
      ],
      name: "store",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  private cardsContractABI = [
    // ABI definitions for Cards.sol
    {
      inputs: [
        { internalType: "uint256", name: "cardPackNo", type: "uint256" },
      ],
      name: "openCardPack",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "getCollection",
      outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
      stateMutability: "view",
      type: "function",
    },
    // other functions...
  ];

  private coinsContractABI = [
    // ABI definitions for Coins.sol
    {
      inputs: [],
      name: "mintCoinShare",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    // other functions...
  ];

  //   private playersContractABI = playersABI.abi.map((item) => {
  //   if (item.type === "function") {
  //     return {
  //       inputs: item.inputs,
  //       name: item.name,
  //       outputs: item.outputs,
  //       stateMutability: item.stateMutability,
  //       type: item.type,
  //     };
  //   }
  //   return item;
  // });

  private playersContractABI = [
    {
      inputs: [
        {
          name: "avatarURI",
          type: "string",
          internalType: "string",
        },
      ],
      name: "createPlayer",
      outputs: [
        {
          name: "newAvatarId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "AvatarAddress",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  constructor(provider: IProvider) {
    this.provider = provider;
  }

  getViewChain(): Chain {
    switch (this.provider.chainId) {
      case "1":
        return mainnet;
      case "0x13882":
        return polygonAmoy;
      case "0xaa36a7":
        return sepolia;
      default:
        return mainnet;
    }
  }

  async getChainId(): Promise<string> {
    try {
      const walletClient = createWalletClient({
        transport: custom(this.provider),
      });

      const chainId = await walletClient.getChainId();
      return chainId.toString();
    } catch (error) {
      console.error("Error getting chain ID:", error);
      throw error;
    }
  }

  async getAddresses(): Promise<string[]> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      return await walletClient.getAddresses();
    } catch (error) {
      console.error("Error getting addresses:", error);
      throw error;
    }
  }

  async getAccounts(): Promise<string[]> {
    try {
      return await this.getAddresses();
    } catch (error) {
      console.error("Error getting accounts:", error);
      throw error;
    }
  }

  async getBalance(): Promise<string> {
    try {
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });
      const address = await this.getAccounts();
      const balance = await publicClient.getBalance({
        address: address[0] as `0x${string}`,
      });
      return formatEther(balance);
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  }

  async signTransaction(): Promise<string> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const destination = "0x40e1c367Eca34250cAF1bc8330E9EddfD403fC56";
      const amount = parseEther("0.0001");
      const address = await this.getAccounts();

      // Prepare transaction
      const request = await walletClient.prepareTransactionRequest({
        account: address[0] as `0x${string}`,
        to: destination,
        value: amount,
      });
      // Sign transaction
      const signature = await walletClient.signTransaction({
        ...request,
        account: address[0] as `0x${string}`,
      });

      // Submit transaction to the blockchain
      const hash = await walletClient.sendRawTransaction({
        serializedTransaction: signature,
      });

      console.log(`Transaction submitted with hash: ${hash}`);

      return hash;
    } catch (error) {
      console.error("Error signing or submitting transaction:", error);
      throw error;
    }
  }

  async sendTransaction(): Promise<TransactionReceipt> {
    try {
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const wcAddresses = await walletClient.getAddresses(); 

      // Data for the transaction
      const destination = "0x1ABe345C38Abf38799Cc5248d747b4ec1B8429dE";
      const amount = parseEther("0.0001");
      const address = await this.getAccounts();

      // Submit transaction to the blockchain
      const hash = await walletClient.sendTransaction({
        account: address[0] as `0x${string}`,
        to: destination,
        value: amount,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return this.toObject(receipt) as TransactionReceipt;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  }

  async signMessage(messageToSign?: string): Promise<string> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      // Data for signing
      const address = await this.getAccounts();
      const originalMessage = "YOUR_MESSAGE";

      // Sign the message
      const signature = await walletClient.signMessage({
        account: address[0] as `0x${string}` | Account,
        message: originalMessage,
      });

      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  }

  async readContract(): Promise<any> {
    try {
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const result = await publicClient.readContract({
        address: "0x9554a5CC8F600F265A89511e5802945f2e8A5F5D",
        abi: this.contractABI,
        functionName: "retrieve",
      });

      return this.toObject(result);
    } catch (error) {
      console.error("Error reading contract:", error);
      throw error;
    }
  }
  
  async writeContract(): Promise<TransactionReceipt> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      // Data for writing to the contract
      const address = await this.getAccounts();
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;

      // Submit transaction to the blockchain
      const hash = await walletClient.writeContract({
        account: address[0] as `0x${string}` | Account,
        address: "0x9554a5CC8F600F265A89511e5802945f2e8A5F5D" as `0x${string}`,
        abi: this.contractABI,
        functionName: "store",
        args: [randomNumber],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return this.toObject(receipt) as TransactionReceipt;
    } catch (error) {
      console.error("Error writing contract:", error);
      throw error;
    }
  }

  async playerAction(
    avatarBasedAccount: string,
    to: string,
    value: bigint,
    calldata: string
  ): Promise<{ reply: string }> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      // Submit the transaction to the blockchain
      const hash = await walletClient.sendTransaction({
        account: avatarBasedAccount as `0x${string}` | Account,
        to: to as `0x${string}`,
        value,
        data: calldata as `0x${string}`,
      });

      // Wait for the transaction receipt
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return { reply: `Transaction successful with hash: ${hash}` };
    } catch (error) {
      console.error("Error performing player action:", error);
      throw error;
    }
  }

  // * NFT Minting: *

  // * The mintNFT function enables the minting of NFTs to a specified recipient. This is crucial for your game's mechanics, where players acquire NFTs representing in-game assets. *
  // * The integration with viem's createWalletClient and createPublicClient provides a seamless way to interact with the blockchain, ensuring transactions are sent and confirmed properly. *

  async mintNFT(
    recipient: string,
    tokenURI: string
  ): Promise<TransactionReceipt> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      // Get the current user's account address
      const address = await this.getAccounts();

      // Submit the transaction to mint the NFT
      const hash = await walletClient.writeContract({
        account: address[0] as `0x${string}` | Account,
        address: "0xNFTContractAddressHere",
        abi: this.contractABI,
        functionName: "mintNFT",
        args: [recipient, tokenURI],
      });

      // Wait for the transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return this.toObject(receipt) as TransactionReceipt;
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  }

  // * Opening Card Packs: *
  // * The openCardPack function manages the purchasing and opening of card packs, which are represented as ERC-1155 tokens. Each pack contains multiple cards (likely ERC-1155 tokens themselves). *
  // * The function handles both the transaction to open the pack and the retrieval of transaction receipts, ensuring the process is smooth and the game logic can proceed based on the outcome. *

  async openCardPack(
    cardPackNo: number,
    value: string
  ): Promise<TransactionReceipt> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const address = await this.getAddresses();

      const hash = await walletClient.writeContract({
        account: address[0] as `0x${string}` | Account,
        address: cardsContract,
        abi: this.cardsContractABI,
        functionName: "openCardPack",
        args: [cardPackNo],
        value: parseEther(value),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return this.toObject(receipt) as TransactionReceipt;
    } catch (error) {
      console.error("Error opening card pack:", error);
      throw error;
    }
  }

  async getCollection(avatarAccountAddress: string): Promise<number[]> {
    try {
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const result = await publicClient.readContract({
        address: cardsContract,
        abi: this.cardsContractABI,
        functionName: "getCollection",
        args: [avatarAccountAddress],
      });

      return result as number[];
    } catch (error) {
      console.error("Error getting card collection:", error);
      throw error;
    }
  }

  // * Coin Share Minting: *
  // * The mintCoinShare function ties in with your game's reward system, where purchasing packs or other in-game actions grant players coin shares. *
  // * This function correctly handles the transaction process, ensuring players receive their allocated coin shares based on their actions. *

  async mintCoinShare(): Promise<TransactionReceipt> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const address = await this.getAddresses();

      const hash = await walletClient.writeContract({
        account: address[0] as `0x${string}` | Account,
        address: coinsContract,
        abi: this.coinsContractABI,
        functionName: "mintCoinShare",
        args: [],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return this.toObject(receipt) as TransactionReceipt;
    } catch (error) {
      console.error("Error minting coin share:", error);
      throw error;
    }
  }

  // * Player Creation (ERC-6551 Wallet): *

  // * The createPlayer function allows the creation of a player associated with an ERC-6551 account. The process involves sending a transaction, waiting for its confirmation, and decoding the logs to extract the avatarId and corresponding avatarAddress. *
  // * The logic to decode the event logs and retrieve the avatar's details is sound. This will ensure that once a player is created, they are correctly linked to the wallet, and the game's subsequent actions can interact with this player. *

  async createPlayer(
    avatarURI: string
  ): Promise<{ avatarId: number | undefined; avatarAddress: string | undefined }> {
    console.log("waypoint 3"); 
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      }); 

      const address = await this.getAddresses();

      console.log("Account:", address[0]);
      console.log(
        "Contract Address:",
        "0xA070608Bc65116D860f3aCF3086Bc345DccA484C"
      );
      console.log("ABI:", this.playersContractABI);
      console.log("Function Name:", "createPlayer");
      console.log("Args:", [avatarURI]);

      // Submit the transaction to create the player
      const hash = await walletClient.writeContract({
        account: address[0] as `0x${string}` | Account, // does this go wrong? 
        address: playersContract, // "0xPlayersContractAddressHere",
        abi: this.playersContractABI,
        functionName: "createPlayer",
        args: [avatarURI],
      });

      const receiptRaw = await publicClient.waitForTransactionReceipt({ hash });
      const receipt = this.toObject(receiptRaw) as TransactionReceipt;

      // Manually decode the event logs. And works perfectly! 
      const events = receipt.logs
        .map((log) => {
          try {
            return decodeEventLog({
              abi: this.playersContractABI,
              data: log.data, // Log data to decode
              topics: log.topics, // Log topics to decode
            });
          } catch (error) {
            console.error("Error decoding log:", error);
            return null;
          }
        })
        .filter(Boolean); 

        if (events.length === 0 || !events[0]?.args) {
          throw new Error("No valid events found in transaction receipt");
        }

        // Accessing the avatarId and address safely
        if (
          'avatarId' in events[0].args && 
          'avatarAccountAddress' in events[0].args
        ) {
          const avatarId = events[0].args.avatarId as number;
          const avatarAddress = events[0].args.avatarAccountAddress as string // `0x${string}`; 

          return { avatarId, avatarAddress };
        } else {
          throw new Error("No valid arguments found in transaction receipt");
        }
        
      } catch (error) {
        console.error("Error creating player:", error);
        throw error;
      }
  }

  async playerAction(
    to: string,
    value: number,
    calldata: string
  ): Promise<{ reply: string }> {
    try {
      const address = await this.getAccounts();

      const walletClient = createWalletClient({
        account: address[0] as `0x${string}`, 
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });
      // console.log("walletClient: ", walletClient); 

      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });
      // console.log("publicClient: ", publicClient); 

      const tokenboundClient = new TokenboundClient({
        walletClient: walletClient,
        chainId: 11155111, // NB hardcoded chainId!  
        implementationAddress: "0x27027C7F5B357aE339f25A421A7F159A58394cE0" // NB hardcoded address!  
      })
      // console.log("tokenboundClient: ", tokenboundClient); 

      const avatarId = await publicClient.readContract({
        address: playersContract,
        abi: this.playersContractABI,
        functionName: "s_avatarIds",
        args: [address[0] as `0x${string}`],
      });
      console.log("avatarId: ", avatarId); 

      const result = await publicClient.readContract({
        address: playersContract, 
        abi: this.playersContractABI,
        functionName: "getAvatarAddress",
        args: [avatarId],
      });
      const avatarBasedAddress = result as `0x${string}`; 
      console.log("avatarBasedAddress: ", avatarBasedAddress); 

      const hash = await tokenboundClient.execute({
        account: avatarBasedAddress, // avatarBasedAddress as `0x${string}`,
        to: to as `0x${string}`,
        value: BigInt(value),
        data: calldata
      })
      // console.log("hash: ", hash); 

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return { reply: `Transaction successful with hash: ${hash}` };
      
    } catch (error) {
      console.error("Error performing player action:", error);
      throw error;
    }
  }


  // * Get Avatar Address: *

  // * The getAvatarAddress function retrieves the address of an avatar based on its ID. *
  // * This is used to map the player's avatar to a specific wallet address after the player has been created. *
  // * The function interacts with the Players contract, calling the getAvatarAddress function to obtain the associated address. *

  async getAvatarAddress(avatarId: number): Promise<string> {
    try {
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      // Call the getAvatarAddress function on the Players contract to get the avatar's address

      const result = await publicClient.readContract({
        address: playersContract, 
        abi: this.playersContractABI,
        functionName: "getAvatarAddress",
        args: [avatarId],
      });

      return result as string;
    } catch (error) {
      console.error("Error getting avatar address:", error);
      throw error;
    }
  }

  toObject<T>(data: T): T {
    return JSON.parse(
      JSON.stringify(data, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    ) as T;
  }

  async sign712Message(
    schema: Schema,
    domain: Domain,
    payload: any
  ): Promise<string> {
    const walletClient = createWalletClient({
      chain: this.getViewChain(),
      transport: custom(this.provider),
    });

    const address = await this.getAccounts();

    let salt: `0x${string}`;

    if (typeof domain.salt === "string") {
      const saltStr = domain.salt.startsWith("0x")
        ? domain.salt.slice(2)
        : domain.salt;
      salt = `0x${saltStr}`;
    } else if (typeof domain.salt === "number") {
      salt = `0x${domain.salt.toString(16).padStart(64, "0")}`;
    } else if (address[0]) {
      const owner = BigInt(address[0]);
      salt = `0x${(owner << 96n).toString(16).padStart(64, "0")}`;
    } else {
      throw new Error("Unable to generate salt: address is undefined");
    }

    // Ensure salt is not undefined
    if (!salt) {
      throw new Error("Salt must be provided or generated.");
    }

    const signature = await walletClient.signTypedData({
      account: address[0] as `0x${string}` | Account,
      domain: {
        ...domain,
        chainId: domain.chainId,
        salt,
      },
      types: schema.types,
      primaryType: schema.primaryType,
      message: payload,
    });

    return signature;
  }
}

export { EthereumRpc };
