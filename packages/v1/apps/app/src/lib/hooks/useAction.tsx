import { useLogs } from "@/lib/context/logs.context";
import { LOG_TYPE } from "@/lib/constants";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { useMruInfo } from "./useMruInfo";
import { EthereumRpc } from "@/lib/viemRPC";
import { Domain, Schema, MRUInfo } from "@/app/api/rollup/types";
import { submitAction } from "@/lib/apiClient";
export const useAction = () => {
  const { rpc, isLoggedIn } = useWeb3Auth();
  const { mruInfo } = useMruInfo();
  const { addLog } = useLogs();

  const submit = async (name: string, payload: any) => {
    if (!mruInfo || !isLoggedIn || !rpc) {
      console.warn("MRU Info, logged in state, or RPC is missing.");
      return;
    }

    const inputs = { ...payload };
    console.log("These are the inputs", inputs);

    // Ensure all indices are non-negative integers
    Object.keys(inputs).forEach((key) => {
      if (typeof inputs[key] === "number" && inputs[key] < 0) {
        throw new Error(
          `Invalid input value for ${key}: ${inputs[key]}. Must be a non-negative integer.`
        );
      }
    });

    const { domain, schemas, transitionToSchema } = mruInfo as MRUInfo;
    const accounts = await rpc.getAccounts();
    const msgSender = accounts[0];

    console.log("Available schemas:", Object.keys(schemas));
    console.log("transitionToSchema:", transitionToSchema);

    // Convert action name to kebab-case for schema lookup
    const convertToKebabCase = (str: string) =>
      str
        .replace(/([a-z])([A-Z])/g, "$1-$2") // Add hyphen between lowercase and uppercase
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .toLowerCase(); // Convert the entire string to lowercase

    const schemaName = convertToKebabCase(name);

    const schema = schemas[schemaName];

    if (!schema) {
      console.error(
        `Schema not found for action: ${name} (Schema name: ${schemaName})`
      );
      console.error("Available schemas:", Object.keys(schemas));
      throw new Error(
        `Schema not found for action: ${name} (Schema name: ${schemaName})`
      );
    }

    console.log("Submitting action:", name, "with payload:", payload);
    console.log("Using schema:", schemaName);

    const signature = await (rpc as EthereumRpc).sign712Message(
      schema,
      domain,
      inputs
    );

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
