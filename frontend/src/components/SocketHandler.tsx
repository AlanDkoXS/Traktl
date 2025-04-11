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
			} else if (!isConnected && 'socket' in window) {
				delete window.socket
			}
		}
	}, [isConnected, setSocketConnected, socket])

	useEffect(() => {
		if (!socket || !isConnected) return

		const timerStore = useTimerStore.getState()

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

		socket.on('timer:start', handleTimerStart)
		socket.on('timer:pause', handleTimerPause)
		socket.on('timer:resume', handleTimerResume)
		socket.on('timer:stop', handleTimerStop)
		socket.on('timer:tick', handleTimerTick)

		return () => {
			socket.off('timer:start', handleTimerStart)
			socket.off('timer:pause', handleTimerPause)
			socket.off('timer:resume', handleTimerResume)
			socket.off('timer:stop', handleTimerStop)
			socket.off('timer:tick', handleTimerTick)
		}
	}, [socket, isConnected])

	useEffect(() => {
		if (!socket) return

		const handleReconnect = () => {
			console.log('Socket reconnected, requesting latest timer state')

			socket.emit('timer:requestSync', { timestamp: new Date() })
		}

		socket.on('reconnect', handleReconnect)

		return () => {
			socket.off('reconnect', handleReconnect)
		}
	}, [socket])

	return null
}

export default SocketHandler
