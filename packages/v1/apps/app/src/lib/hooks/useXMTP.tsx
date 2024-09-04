import { useEffect, useState, useCallback } from 'react';
import { Client } from '@xmtp/xmtp-js';
import { useWeb3Auth } from '@/lib/context/web3auth';
import { Signer } from '@xmtp/xmtp-js';
import { useDynamicIslandStore } from '@/lib/context/xmtp/gameNotifications';

export const useXMTP = () => {
  const { rpc, isLoggedIn } = useWeb3Auth();
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const { setMessage, setVisibility } = useDynamicIslandStore();
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [receivedAction, setReceivedAction] = useState<{ action: string, inputs: any } | null>(null);

  const processQueue = useCallback(() => {
    if (messageQueue.length > 0) {
      const message = messageQueue[0];
      setMessage(message || null);
      setVisibility(true);
      setTimeout(() => {
        setVisibility(false);
        setMessageQueue(prev => prev.slice(1));
      }, 5000);
    }
  }, [messageQueue, setMessage, setVisibility]);

  useEffect(() => {
    const timer = setInterval(processQueue, 6000);
    return () => clearInterval(timer);
  }, [processQueue]);

  useEffect(() => {
    const initXMTP = async () => {
      if (isLoggedIn && rpc && !xmtpClient) {
        try {
          const accounts = await rpc.getAccounts();
          const wallet: Signer = {
            getAddress: async () => accounts[0] as string,
            signMessage: async (message: string) => {
              const signature = await rpc.signMessage(message);
              if (!signature) throw new Error('Failed to sign message');
              return signature;
            },
          };

          const client = await Client.create(wallet, { env: 'dev' });
          setXmtpClient(client);
          startMessageStream(client);
        } catch (error) {
          console.error('Error initializing XMTP client:', error);
        }
      }
    };

const startMessageStream = async (client: Client) => {
  try {
    const conversationStream = await client.conversations.stream();
    for await (const conversation of conversationStream) {
      for await (const message of await conversation.streamMessages()) {
        try {
          const parsedContent = JSON.parse(message.content);
          if (parsedContent && typeof parsedContent === 'object') {
            const gameAction = {
              action: parsedContent.action,
              inputs: parsedContent.inputs,
            };
            if (['initializeGame', 'playTurn', 'finalizeGame'].includes(gameAction.action)) {
              setMessageQueue(prev => [...prev, `${gameAction.action}: ${JSON.stringify(gameAction.inputs)}`]);
              setReceivedAction(gameAction);
            }
          }
        } catch (error) {
          console.error('Failed to parse or process message content:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error streaming messages:', error);
  }
};

    initXMTP();
  }, [isLoggedIn, rpc, xmtpClient, setMessage, setVisibility]);

  return { xmtpClient, receivedAction };
};
