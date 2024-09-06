import { ActionConfirmationStatus } from "@stackr/sdk";
import express, { Request, Response } from "express";
import { tournamentMachine, gameMachine } from "./stackr/machine";
import { mru } from "./stackr/mru";
import { schemas } from "./stackr/schemas";
import { allTransitions, tournamentTransitions, cardGameTransitions } from "./stackr/transitions";

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
    next();
  });

  const { config, getStfSchemaMap, submitAction } = mru;

  // Use the imported machines directly
  const tournamentMachineInstance = tournamentMachine;
  const gameMachineInstance = gameMachine;

  const transitionToSchema = getStfSchemaMap();


  /** Routes */
  app.get("/info", (_req: Request, res: Response) => {
    res.send({
      isSandbox: config.isSandbox,
      domain: config.domain,
      transitionToSchema,
      schemas: Object.values(schemas).reduce((acc, schema) => {
        acc[schema.identifier] = {
          primaryType: schema.EIP712TypedData.primaryType,
          types: schema.EIP712TypedData.types,
        };
        return acc;
      }, {} as Record<string, any>),
    });
  });

app.post("/:transition", async (req: Request, res: Response) => {
  
  const transition = req.params.transition;

  console.log('Received transition:', transition);
  console.log('All transitions:', Object.keys(allTransitions));
  console.log('Tournament transitions:', Object.keys(tournamentTransitions));
  console.log('Card game transitions:', Object.keys(cardGameTransitions));

  if (!(transition.toLowerCase() in allTransitions)) {
    res.status(400).send({ message: "NO_TRANSITION_FOR_ACTION" });
    return;
  }

  try {
    const { msgSender, signature, inputs } = req.body;

    console.log(`Transition received: ${transition}`);
    console.log('Available schemas:', Object.keys(schemas));

    const schema = schemas[transition as keyof typeof schemas];

    console.log(`Looking for schema with ID: ${transition}`);
    if (schema) {
      console.log('Found schema:', schema.identifier);
    } else {
      console.log('Schema not found for transition:', transition);
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

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}