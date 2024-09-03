import { useLogs } from "@/lib/context/logs.context";
import { LOG_TYPE } from "@/lib/constants";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { submitAction } from "@/actions/rollup/api";
import { useMruInfo } from "./useMruInfo";
import { EthereumRpc } from "@/lib/viemRPC";
import { ActionSchema } from "@stackr/sdk";

export const useAction = () => {
  const { rpc, isLoggedIn } = useWeb3Auth();
  const { mruInfo } = useMruInfo();
  const { addLog } = useLogs();

  const submit = async (name: string, payload: any) => {
    if (!mruInfo || !isLoggedIn || !rpc) {
      return;
    }

    const inputs = { ...payload };
    const { transitionToSchema, domain, schemas } = mruInfo;
    const accounts = await rpc.getAccounts();
    const msgSender = accounts[0];

    const schemaName = transitionToSchema[name];
    const schema = schemas[schemaName as keyof typeof schemas];

    if (!schema) {
      throw new Error(`Schema not found for action: ${name}`);
    }

    const signature = await (rpc as EthereumRpc).sign712Message(schema as unknown as ActionSchema, inputs);

    addLog({
      type: LOG_TYPE.REQUEST,
      time: Date.now(),
      value: {
        transitionName: name,
        payload: { inputs, msgSender, signature },
      },
    });

    try {
      const response = await submitAction(name, {
        msgSender,
        signature,
        inputs,
      });

      addLog({
        type: LOG_TYPE.C0_RESPONSE,
        time: Date.now(),
        value: { acknowledgementHash: response.ackHash },
      });
      addLog({
        type: LOG_TYPE.C1_RESPONSE,
        time: Date.now(),
        value: { logs: response.logs },
      });

      return response;
    } catch (e) {
      addLog({
        type: LOG_TYPE.ERROR,
        time: Date.now(),
        value: { message: (e as Error).message },
      });
      throw e;
    }
  };

  return { submit };
};