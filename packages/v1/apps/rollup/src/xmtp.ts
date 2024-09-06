import { Client, Conversation } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";
import { ActionEvents } from "@stackr/sdk";

class XMTPNotifier {
  xmtpClient: Client;
  conversations: Map<string, Conversation> = new Map();

  constructor(xmtpClient: Client) {
    this.xmtpClient = xmtpClient;
  }

  async getOrCreateConversation(address: string): Promise<Conversation> {
    if (!this.conversations.has(address)) {
      const conversation = await this.xmtpClient.conversations.newConversation(
        address
      );
      this.conversations.set(address, conversation);
    }
    return this.conversations.get(address)!;
  }

  async notifyUser(address: string, message: string) {
    try {
      const conversation = await this.getOrCreateConversation(address);
      await conversation.send(message);
      console.log(`Sent message to ${address}:`, message);
    } catch (error) {
      console.error(`Failed to send message to ${address}:`, error);
    }
  }
}

let xmtpNotifier: XMTPNotifier;

async function initializeXMTP(mru: any) {
  const wallet = new Wallet(process.env.PRIVATE_KEY!);
  const xmtpClient = await Client.create(wallet);
  xmtpNotifier = new XMTPNotifier(xmtpClient);
  console.log("XMTP client initialized");
  mru.events.subscribe(ActionEvents.SUBMIT, async (args: any) => {
    if (args.msgSender && args.action) {
      const { action, inputs } = args;
      if (['initializeGame', 'playTurn', 'finalizeGame'].includes(action)) {
        await xmtpNotifier.notifyUser(
          args.msgSender as string,
          JSON.stringify({ action, inputs })
        );
      }
    }
  });
}

export { initializeXMTP, XMTPNotifier };