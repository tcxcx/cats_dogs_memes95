
import { ActionSchema, AllowedInputTypes } from "@stackr/sdk";
import { EthereumRpc } from "@v1/app/web3auth";

export const signMessage = async (
  rpc: EthereumRpc,
  schema: ActionSchema,
  payload: AllowedInputTypes
) => {
  const signature = await rpc.signMessage(payload);
  return signature;
};