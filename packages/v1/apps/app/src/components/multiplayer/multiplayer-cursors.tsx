import Cursor from './cursor'
import { FC, memo, RefObject } from 'react'
import { useOthers } from '@liveblocks/react'
import { CURSOR_COLORS, CURSOR_NAMES } from '@/lib/utils'
import useTrackCursor from '@/lib/hooks/game/useTrackCursor'

// Define the Point type
type Point = { x: number; y: number }

const MultiplayerCursors: FC<{ canvas: RefObject<HTMLDivElement> }> = ({ canvas }) => {
	useTrackCursor(canvas)
	const others = useOthers()

	if (!others) return null

	return (
		<>
			{others.map(({ connectionId, presence, info }) => {
				if (!presence || !presence.cursor) return

				// Ensure presence.cursor is of type Point
				const cursorPos = presence.cursor as Point

				return (
					<Cursor
						name={info?.name}
						key={connectionId}
						pos={cursorPos}
						avatar={info?.avatar}
						emoji={CURSOR_NAMES[connectionId % CURSOR_NAMES.length] || ''}
						color={CURSOR_COLORS[connectionId % CURSOR_COLORS.length] || ''}
					/>
				)
			})}
		</>
	)
}

export default memo(MultiplayerCursors)