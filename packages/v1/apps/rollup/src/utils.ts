import {
  hexlify,
  isHexString,
  keccak256,
  solidityPackedKeccak256,
  ZeroHash,
} from "ethers";
import { MerkleMountainRange, MerkleTree } from "merkletreejs";

export interface MMRResponse {
  rootHash: string;
  merkleProof: (leaf: string) =>
    | {
        root: string;
        width: number;
        index: number;
        peakBagging: string[];
        siblings: string[];
      }
    | undefined;
  verifyProof: (
    leafIndex: number,
    leaf: string,
    width: number,
    peakBagging: string[],
    siblings: string[]
  ) => boolean;
}

export interface MTResponse {
  rootHash: string;
  merkleProof: (leaf: string) =>
    | {
        root: string;
        proof: string[];
      }
    | undefined;
  verifyProof: (leaf: string, proof: string[]) => boolean;
}

const hashLeafFn = (index: number, dataHash: Buffer): string =>
  solidityPackedKeccak256(["uint256", "bytes32"], [index, hexlify(dataHash)]);

const peakBaggingFn = (size: number, peaks: Buffer[]): string =>
  solidityPackedKeccak256(
    ["uint256", "bytes32"],
    [
      size,
      solidityPackedKeccak256(
        ["uint256", "bytes32[]"],
        [size, peaks.map((peak) => hexlify(peak))]
      ),
    ]
  );

const hashBranchFn = (index: number, left: Buffer, right: Buffer): string =>
  solidityPackedKeccak256(
    ["uint256", "bytes32", "bytes32"],
    [index, hexlify(left), hexlify(right)]
  );

/**
 *       7
 *   3       6       10
 * 1   2   4   5   8    9   11
 * 1   2   3   4   5    6    7
 * @param items List of items to be included in the Merkle Mountain Range
 * @param serializer Optional function to serialize the items
 * @returns `MMRResponse` object
 */
export const createMMR = <ConvertibleItem>(
  items: ConvertibleItem[],
  serializer?: (item: ConvertibleItem) => string
): MMRResponse => {
  const mmr = new MerkleMountainRange(
    keccak256,
    serializer ? items.map(serializer) : items,
    hashLeafFn,
    peakBaggingFn,
    hashBranchFn
  );

  const rootHash = mmr.getHexRoot();

  return {
    rootHash: rootHash === "0x" ? ZeroHash : rootHash,
    merkleProof: (leaf: string) => {
      const hashes = Object.keys(mmr.data);
      const itemIndex = hashes.indexOf(keccak256(leaf));
      if (itemIndex === -1) {
        // Leaf not found
        return undefined;
      }
      const leafIndex = mmr.getLeafIndex(itemIndex + 1); // indexing in tree starts from 1
      const mmrProof = mmr.getMerkleProof(leafIndex);
      return {
        root: mmr.bufferToHex(mmrProof.root),
        width: mmrProof.width,
        index: leafIndex,
        peakBagging: mmrProof.peakBagging.map((peak) => mmr.bufferToHex(peak)),
        siblings: mmrProof.siblings.map((sibling) => mmr.bufferToHex(sibling)),
      };
    },
    verifyProof: (
      leafIndex: number,
      leaf: string,
      width: number,
      peaks: string[],
      siblings: string[]
    ): boolean => {
      try {
        return mmr.verify(
          mmr.getRoot(),
          width,
          leafIndex,
          leaf,
          peaks.map((peak) => (isHexString(peak) ? mmr.bufferify(peak) : peak)),
          siblings.map((sibling) =>
            isHexString(sibling) ? mmr.bufferify(sibling) : sibling
          )
        );
      } catch (error) {
        return false;
      }
    },
  };
};

/**
 * @param items List of items to be included in the Merkle Tree
 * @param serializer Optional function to serialize the items
 * @returns `MTResponse` object
 */
export const createMT = <ConvertibleItem>(
  items: ConvertibleItem[],
  serializer?: (item: ConvertibleItem) => string
): MTResponse => {
  const mt = new MerkleTree(
    serializer ? items.map(serializer) : items,
    keccak256,
    {
      hashLeaves: false,
      sortLeaves: true,
      sortPairs: true,
    }
  );

  const hexRoot = mt.getHexRoot();
  const rootHash = hexRoot === "0x" ? ZeroHash : hexRoot;

  return {
    rootHash,
    merkleProof: (leaf: string) => {
      const proof = mt.getHexProof(leaf);
      if (proof.length === 0) {
        return undefined;
      }
      return {
        root: rootHash,
        proof,
      };
    },
    verifyProof: (leaf: string, proof: string[]): boolean => {
      try {
        return mt.verify(proof, leaf, mt.getRoot());
      } catch (error) {
        return false;
      }
    },
  };
};