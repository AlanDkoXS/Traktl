import { useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import { useTimerStore } from '../store/timerStore'
import { Socket } from 'socket.io-client'

declare global {
	interface Window {
		socket?: Socket
	}
}

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

const SocketHandler = () => {
	const { socket, isConnected } = useSocket()
	const { setSocketConnected } = useTimerStore()
	const prevConnectedRef = useRef(false)

	useEffect(() => {
		if (prevConnectedRef.current !== isConnected) {
			setSocketConnected(isConnected)
			prevConnectedRef.current = isConnected

			if (socket && isConnected) {
				window.socket = socket
				// Request current state when connecting
				socket.emit('timer:requestSync', { timestamp: new Date() })
			} else if (!isConnected && 'socket' in window) {
				delete window.socket
			}
		}
	}, [isConnected, setSocketConnected, socket])

	useEffect(() => {
		if (!socket || !isConnected) return

		const handleTimerAction =
			(actionType: string) => (data: TimerActionData) => {
				console.log(`Recibido ${actionType}:`, data)
				const timerStore = useTimerStore.getState()
				timerStore.handleRemoteTimerAction(actionType, data)
			}

		const timerEvents = {
			'timer:start': handleTimerAction('timer:start'),
			'timer:pause': handleTimerAction('timer:pause'),
			'timer:resume': handleTimerAction('timer:resume'),
			'timer:stop': handleTimerAction('timer:stop'),
			'timer:tick': handleTimerAction('timer:tick'),
		}

		// Register all events
		Object.entries(timerEvents).forEach(([event, handler]) => {
			socket.on(event, handler)
		})

		socket.on('timer:requestState', (data) => {
			console.log('State request by another client', data)
			const currentState = useTimerStore.getState()

			socket.emit('timer:start', {
				status: currentState.status,
				mode: currentState.mode,
				elapsed: currentState.elapsed,
				projectId: currentState.projectId,
				taskId: currentState.taskId,
				workStartTime: currentState.workStartTime,
				infiniteMode: currentState.infiniteMode,
				workDuration: currentState.workDuration,
				breakDuration: currentState.breakDuration,
				repetitions: currentState.repetitions,
				currentRepetition: currentState.currentRepetition,
				timestamp: new Date(),
				shouldSave: false,
			})
		})

		return () => {
			// Clean up all events
			Object.keys(timerEvents).forEach((event) => {
				socket.off(event)
			})
			socket.off('timer:requestState')
		}
	}, [socket, isConnected])

	return null
}

export default SocketHandler
