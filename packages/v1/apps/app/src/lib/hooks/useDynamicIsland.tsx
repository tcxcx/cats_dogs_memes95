import { useEffect } from 'react';
import { useDynamicIslandStore } from '@/lib/context/xmtp/gameNotifications';
import { useDynamicIslandSize } from '@v1/ui/dynamic-island';

export const useDynamicIsland = () => {
  const { message, isVisible, setMessage, setVisibility } = useDynamicIslandStore();
  const { setSize } = useDynamicIslandSize();

  const showMessage = (newMessage: string, duration = 5000) => {
    setMessage(newMessage);
    setVisibility(true);
    setSize('large');

    setTimeout(() => {
      setVisibility(false);
      setSize('compact');
      setMessage(null);
    }, duration);
  };

  return { message, isVisible, showMessage };
};