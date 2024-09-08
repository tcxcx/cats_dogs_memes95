import useCamera from '@/lib/context/game/camera'
import { LiveList, Status } from '@liveblocks/client'
import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { LiveblocksProvider, RoomProvider, useRoom } from '@liveblocks/react'

export const LiveProvider: FC<PropsWithChildren<{ roomId: string; onAuthFailure?: () => void }>> = ({
	roomId,
	children,
	onAuthFailure,
}) => {
	const [state, setState] = useState<Status>('initial')

	useEffect(() => {
		if (!roomId) return;

		useCamera.persist.setOptions({ name: `camera-${roomId}` });
		useCamera.persist.rehydrate();
	}, [roomId, useCamera]);

	useEffect(() => {
		if (state != 'disconnected') return

		onAuthFailure && onAuthFailure()
	}, [state, onAuthFailure])

	return (
		<LiveblocksProvider authEndpoint="/api/auth">
			<RoomProvider
				id={roomId}
				initialStorage={{ cards: new LiveList([]) }}
				initialPresence={{ cursor: null, selectedCard: null }}
			>
				<RoomStateWatcher setState={setState} />
				{children}
			</RoomProvider>
		</LiveblocksProvider>
	)
}

export const RoomStateWatcher = ({ setState }: { setState: (status: Status) => void }) => {
	const room = useRoom()

	useEffect(() => {
		const unsubscribe = room.subscribe('status', setState)

		return unsubscribe
	})

	return null
}

export const getRoomsUserCount = async (roomId: string, jwtToken: string): Promise<number> => {
	try {
	  const result = await fetch(`https://liveblocks.net/api/v1/room/${roomId}/users`, {
		headers: {
		  Authorization: `Bearer ${jwtToken}`,
		  'Content-Type': 'application/json',
		},
	  }).then(res => res.json());
  
	  return result.data.length;
	} catch (error) {
	  console.error('Failed to fetch room user count:', error);
	  return 0; // or handle the error appropriately
	}
  };