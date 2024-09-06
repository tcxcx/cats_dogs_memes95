import { ActionConfirmationStatus } from "@stackr/sdk";
import express, { Request, Response } from "express";
import { tournamentMachine, gameMachine } from "./stackr/machine";
import { mru } from "./stackr/mru";
import { schemas } from "./stackr/schemas";
import {
  allTransitions,
  tournamentTransitions,
  cardGameTransitions,
} from "./stackr/transitions";

const PORT = 3210;

export async function setupServer() {
  const app = express();
  app.use(express.json());
  // allow CORS
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, DELETE"
    );
    next();
  });

  app.use((err: any, req: Request, res: Response, next: Function) => {
    console.error("Error in rollup server:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });

  const { config, getStfSchemaMap, submitAction } = mru;

  // Use the imported machines directly
  const tournamentMachineInstance = tournamentMachine;
  const gameMachineInstance = gameMachine;

  const transitionToSchema = getStfSchemaMap();

  const getPlayerInfo = (playerId: number) => {
    const player = tournamentMachineInstance.state.players.find(
      (p) => p.id === playerId
    );
    if (!player) throw new Error("PLAYER_NOT_FOUND");
    return player;
  };

  // Helper function to get match info
  const getMatchInfo = (matchId: number) => {
    const match = tournamentMachineInstance.state.matches.find(
      (m) => m.id === matchId
    );
    if (!match) throw new Error("MATCH_NOT_FOUND");
    return match;
  };

  // === ACTION ROUTES ===

  /** Routes */
  app.get("/info", (_req: Request, res: Response) => {
    res.send({
      isSandbox: config.isSandbox,
      domain: config.domain,
      transitionToSchema,
      schemas: Object.values(schemas).reduce(
        (acc, schema) => {
          acc[schema.identifier] = {
            primaryType: schema.EIP712TypedData.primaryType,
            types: schema.EIP712TypedData.types,
          };
          return acc;
        },
        {} as Record<string, any>
      ),
    });
  });

  app.post("/:transition", async (req: Request, res: Response) => {
    const transition = req.params.transition;

    console.log("Received transition:", transition);
    console.log("All transitions:", Object.keys(allTransitions));
    console.log("Tournament transitions:", Object.keys(tournamentTransitions));
    console.log("Card game transitions:", Object.keys(cardGameTransitions));

    if (!(transition.toLowerCase() in allTransitions)) {
      res.status(400).send({ message: "NO_TRANSITION_FOR_ACTION" });
      return;
    }

    try {
      const { msgSender, signature, inputs } = req.body;

      console.log(`Transition received: ${transition}`);
      console.log("Available schemas:", Object.keys(schemas));

      const schema = schemas[transition as keyof typeof schemas];

      console.log(`Looking for schema with ID: ${transition}`);
      if (schema) {
        console.log("Found schema:", schema.identifier);
      } else {
        console.log("Schema not found for transition:", transition);
      }

      if (!schema) {
        throw new Error("NO_SCHEMA_FOUND");
      }

      const signedAction = schema.actionFrom({
        msgSender,
        signature,
        inputs,
      });

      let ack;
      if (transition in tournamentTransitions) {
        ack = await submitAction(transition, signedAction);
      } else if (transition in cardGameTransitions) {
        ack = await submitAction(transition, signedAction);
      } else {
        throw new Error("INVALID_TRANSITION");
      }

      const { logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1);

      if (errors?.length) {
        throw new Error(errors[0].message);
      }

      res.status(201).send({ logs, ackHash: ack.hash });
    } catch (e: any) {
      res.status(400).send({ error: e.message });
    }
  });

  // === TOURNAMENT ROUTES ===

  app.get("/players", (_req: Request, res: Response) => {
    console.log("GET /players request received");
    const players = tournamentMachineInstance.state.players;
    console.log("Players:", players);
    res.send(players);
  });

  // Add similar logging to other routes

  app.get("/matches/:id", (req: Request, res: Response) => {
    const matchId = parseInt(req.params.id);
    try {
      const match = getMatchInfo(matchId);
      const playerInfo = Object.keys(match.scores).map((playerId) =>
        getPlayerInfo(parseInt(playerId))
      );
      res.send({ ...match, playerInfo });
    } catch (error) {
      res.status(404).send({ message: (error as Error).message });
    }
  });

  app.get("/matches", (_req: Request, res: Response) => {
    const matches = tournamentMachineInstance.state.matches;
    res.send(matches);
  });

  app.get("/player-leaderboard", (_req: Request, res: Response) => {
    const players = tournamentMachineInstance.state.players;
    const matches = tournamentMachineInstance.state.matches;

    const leaderboard = players
      .map((player) => {
        const wins = matches.filter((m) => m.winnerId === player.id).length;
        return { ...player, wins };
      })
      .sort((a, b) => b.wins - a.wins);

    res.send(leaderboard);
  });

  app.get("/players/:id", (req: Request, res: Response) => {
    const playerId = parseInt(req.params.id);
    try {
      const player = getPlayerInfo(playerId);
      const matches = tournamentMachineInstance.state.matches;
      const wins = matches.filter((m) => m.winnerId === playerId).length;
      res.send({ ...player, wins });
    } catch (error) {
      res.status(404).send({ message: (error as Error).message });
    }
  });

  app.get("/awards", (_req: Request, res: Response) => {
    const players = tournamentMachineInstance.state.players;
    const matches = tournamentMachineInstance.state.matches;

    if (players.length === 0 || matches.length === 0) {
      return res.json({
        mostWins: null,
        highestWinRate: null,
        mostGamesPlayed: null,
      });
    }

    const playerStats = players.map((player) => {
      const wins = matches.filter((m) => m.winnerId === player.id).length;
      const gamesPlayed = matches.filter((m) =>
        Object.keys(m.scores).includes(player.id.toString())
      ).length;
      return { ...player, wins, gamesPlayed };
    });

    const mostWins = playerStats.reduce((prev, current) =>
      prev.wins > current.wins ? prev : current
    );
    const highestWinRate = playerStats.reduce((prev, current) =>
      prev.wins / prev.gamesPlayed > current.wins / current.gamesPlayed
        ? prev
        : current
    );
    const mostGamesPlayed = playerStats.reduce((prev, current) =>
      prev.gamesPlayed > current.gamesPlayed ? prev : current
    );

    res.json({
      mostWins,
      highestWinRate,
      mostGamesPlayed,
    });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
