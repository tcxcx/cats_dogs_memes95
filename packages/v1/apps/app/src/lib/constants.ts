import { zeroAddress } from "viem";

export const ZeroAddress = zeroAddress;

export const avatarBasedAccountsImplementation = "0x27027C7F5B357aE339f25A421A7F159A58394cE0" as `0x${string}`;
export const playersContract = "0x94D4eD144d590722d253054B416361E41e278857" as `0x${string}`;
export const cardsContract = "0x5e48B24C922eB20Bbc3C08222165Eeb5D4593b14" as `0x${string}`;
export const coinsContract = "0x7d37144fee683b79b50dBFe9339f3E0403dAb3FF" as `0x${string}`;
export const gamesContract = "0x79c81b8EE31fDF46ce07A1Cc0EF264C735d28abB" as `0x${string}`;

export enum BlockStatus {
  Proposed = "proposed",
  Sequenced = "sequenced",
  Submitting = "submitting",
  Received = "received",
  Rejected = "rejected",
  Verified = "verified",
  Invalid = "invalid",
  DAFinalized = "da_finalized",
  L1Posted = "l1_posted",
  L1Finalized = "l1_finalized",
}

export enum DA {
  AVAIL = "avail",
  CELESTIA = "celestia",
  EIGEN = "eigen",
}

export enum LOG_TYPE {
  REQUEST = "request",
  C0_RESPONSE = "c0 response",
  C1_RESPONSE = "c1 response",
  ERROR = "error",
}