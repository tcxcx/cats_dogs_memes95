import { State } from "@stackr/sdk/machine";
import { solidityPackedKeccak256 } from "ethers";
import { GameStateLog } from "@v1/app/types";

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
