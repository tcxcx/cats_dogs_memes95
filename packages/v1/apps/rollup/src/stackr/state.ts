import { State } from "@stackr/sdk/machine";
import { solidityPackedKeccak256 } from "ethers";
import { createMMR, createMT } from "../utils";
import { keccak256, solidityPacked } from "ethers";
import { TournamentState, GameStateLog } from "./types";

export class Tournament extends State<TournamentState> {
  constructor(state: TournamentState) {
    super(state);
  }

 getRootHash(): string {
    const { admins, players, matches, meta, logs } = this.state;
    const adminsMerkleTree = createMT(admins, (a) =>
      solidityPacked(["address"], [a])
    );

    const playersMerkleTree = createMT(players, (p) =>
      solidityPacked(
        ["uint256", "string", "uint256", "uint256"],
        [p.id, p.name || 0]
      )
    );

    const matchesMMR = createMMR(matches, (m) => {
      const playerIds = Object.keys(m.scores).map((k) => parseInt(k));
      const scores = playerIds.map((id) => m.scores[id]);
      return solidityPacked(
        [
          "uint256",
          "uint256",
          "uint256",
          "uint256",
          "uint256",
          "uint256",
          "uint256",
          "uint256",
          "uint256",
        ],
        [
          m.id,
          playerIds[0] || 0,
          playerIds[1] || 0,
          scores[0] || 0,
          scores[1] || 0,
          m.startTime || 0,
          m.endTime || 0,
          m.winnerId || 0,
        ]
      );
    });

     const logsMMR = createMMR(logs, (l) =>
      solidityPacked(
        ["uint256", "uint256", "string", "uint256"],
        [l.playerId, l.timestamp, l.action, l.matchId || 0]
      )
    );

    const metaHash = keccak256(
      solidityPacked(
        ["uint256", "uint256", "uint256", "uint256", "string"],
        Object.values(meta).map((v) => {
          if (typeof v === "number") {
            return v;
          }
          return Object.entries(v)
            .map(([k, v]) => `${k}:${v}`)
            .join(",");
        })
      )
    );

    const finalMerkleTree = createMT([
      adminsMerkleTree.rootHash,
      metaHash,
      playersMerkleTree.rootHash,
      matchesMMR.rootHash,
      logsMMR.rootHash,
    ]);

    return finalMerkleTree.rootHash;
  }
}

export class CardGameState extends State<GameStateLog> {
  constructor(state: GameStateLog) {
    super(state);
  }

  getRootHash() {
    return solidityPackedKeccak256(
      ["uint256", "uint256", "uint256", "string"],
      [
        this.state.score[0],
        this.state.score[1],
        this.state.turnCount,
        JSON.stringify(this.state.gameLog),
      ]
    );
  }

  transformer() {
    return {
      wrap: () => this.state,
      unwrap: (state: GameStateLog) => state,
    };
  }
}
