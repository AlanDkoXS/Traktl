import { useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import { useTimerStore } from '../store/timerStore'
import { Socket } from 'socket.io-client'

// Extend Window interface to allow socket property
declare global {
	interface Window {
		socket?: Socket
	}
}

// Define the type for timer action data
interface TimerActionData {
	status?: 'idle' | 'running' | 'paused' | 'break'
	mode?: 'work' | 'break'
	elapsed?: number
	projectId?: string | null
	taskId?: string | null
	workStartTime?: Date | string
	infiniteMode?: boolean
	workDuration?: number
	breakDuration?: number
	repetitions?: number
	currentRepetition?: number
	timestamp?: Date | string
	shouldSave?: boolean
}

/**
 * Component that handles Socket.io events and connects them to the stores
 * This component doesn't render anything, it just connects events
 */
const SocketHandler = () => {
	const { socket, isConnected } = useSocket()
	const { setSocketConnected } = useTimerStore()

	// Use refs to track previous connection state to avoid unnecessary updates
	const prevConnectedRef = useRef(false)

	// Update socket connection status in the timer store only when it changes
	useEffect(() => {
		// Only update if the connection status has changed
		if (prevConnectedRef.current !== isConnected) {
			setSocketConnected(isConnected)
			prevConnectedRef.current = isConnected

			// Make socket globally available for direct access from stores
			if (socket && isConnected) {
				window.socket = socket
			} else if (!isConnected && 'socket' in window) {
				delete window.socket
			}
		}
	}, [isConnected, setSocketConnected, socket])

	// Set up socket event listeners for timer events
	useEffect(() => {
		if (!socket || !isConnected) return

		// Use getState to avoid re-renders and dependency issues
		const timerStore = useTimerStore.getState()

		// Handle timer events
		const handleTimerStart = (data: TimerActionData) => {
			timerStore.handleRemoteTimerAction('timer:start', data)
		}

		const handleTimerPause = (data: TimerActionData) => {
			timerStore.handleRemoteTimerAction('timer:pause', data)
		}

		const handleTimerResume = (data: TimerActionData) => {
			timerStore.handleRemoteTimerAction('timer:resume', data)
		}

		const handleTimerStop = (data: TimerActionData) => {
			timerStore.handleRemoteTimerAction('timer:stop', data)
		}

		const handleTimerTick = (data: TimerActionData) => {
			timerStore.handleRemoteTimerAction('timer:tick', data)
		}

		// Register event handlers
		socket.on('timer:start', handleTimerStart)
		socket.on('timer:pause', handleTimerPause)
		socket.on('timer:resume', handleTimerResume)
		socket.on('timer:stop', handleTimerStop)
		socket.on('timer:tick', handleTimerTick)

		// Clean up event handlers
		return () => {
			socket.off('timer:start', handleTimerStart)
			socket.off('timer:pause', handleTimerPause)
			socket.off('timer:resume', handleTimerResume)
			socket.off('timer:stop', handleTimerStop)
			socket.off('timer:tick', handleTimerTick)
		}
	}, [socket, isConnected])

	// Handle reconnection events
	useEffect(() => {
		if (!socket) return

		const handleReconnect = () => {
			console.log('Socket reconnected, requesting latest timer state')

			// Emit event to request the latest timer state from the server
			socket.emit('timer:requestSync', { timestamp: new Date() })
		}

		socket.on('reconnect', handleReconnect)

		return () => {
			socket.off('reconnect', handleReconnect)
		}
	}, [socket])

	// Component doesn't render anything
	return null
}

// Ensure we're exporting the component correctly
export default SocketHandler
