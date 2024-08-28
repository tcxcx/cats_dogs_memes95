import { RefObject } from 'react'
import { screenToCanvas } from '@/lib/canvas'
import { useRefCamera } from '@/lib/context/game/camera'
import { useGesture } from '@use-gesture/react'
import { useUpdateMyPresence } from '@liveblocks/react'

const useTrackCursor = (canvasRef: RefObject<HTMLDivElement>) => {
	const camera = useRefCamera()
	const updateMyPresence = useUpdateMyPresence()

	useGesture(
		{
			onPointerMove: ({ event }) => {
				if (camera.current) {
					updateMyPresence({ cursor: screenToCanvas({ x: event.clientX, y: event.clientY }, camera.current) })
				}
			},
			onPointerLeave: () => {
				updateMyPresence({ cursor: null })
			},
		},
		{ target: canvasRef }
	)
}

export default useTrackCursor