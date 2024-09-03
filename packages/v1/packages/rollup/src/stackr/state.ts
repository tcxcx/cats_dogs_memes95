import { State } from "@stackr/sdk/machine";
import { solidityPackedKeccak256 } from "ethers";
import { CardData, CardCollection } from "@v1/app/types";

export type GameState = {
  deckP1: string[];
  deckP2: string[];
  handP1: CardData[];
  handP2: CardData[];
  score: number[];
  turnCount: number;
  cardCollection: CardCollection;
  powerList: string[];
  typeList: string[];
};

export class CardGameState extends State<GameState> {
  constructor(state: GameState) {
    super(state);
  }

  getRootHash() {
    return solidityPackedKeccak256(
      ["string[]", "string[]", "uint256[]", "uint256", "string[]", "string[]"],
      [
        this.state.deckP1,
        this.state.deckP2,
        this.state.score,
        this.state.turnCount,
        this.state.powerList,
        this.state.typeList,
      ]
    );
  }
}
