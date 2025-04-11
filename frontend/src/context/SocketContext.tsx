import React, { createContext, useContext, useEffect, useState } from 'react'
import { Socket, Manager } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

interface SocketContextType {
	socket: Socket | null
	isConnected: boolean
	reconnect: () => void
}

const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false,
	reconnect: () => {},
})

export const useSocket = () => useContext(SocketContext)

interface SocketProviderProps {
	children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
	const [socket, setSocket] = useState<Socket | null>(null)
	const [isConnected, setIsConnected] = useState(false)
	const { token, user, isAuthenticated } = useAuthStore()

	const setupSocket = () => {
		if (!token || !user || !isAuthenticated) return

		const socketUrl =
			import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
		console.log('Intentando conectar Socket.io a:', socketUrl)

		try {
			const manager = new Manager(socketUrl, {
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
				reconnectionDelayMax: 5000,
				timeout: 20000,
				transports: ['websocket', 'polling'],
			})

			const newSocket = manager.socket('/', {
				auth: {
					token,
					userId: user.id,
				},
			})

			console.log('Socket inicializado correctamente')

			newSocket.on('connect', () => {
				console.log('Socket connected')
				setIsConnected(true)
			})

			newSocket.on('disconnect', (reason) => {
				console.log('Socket disconnected:', reason)
				setIsConnected(false)
			})

			newSocket.on('connect_error', (error) => {
				console.error('Socket connection error:', error)
				setIsConnected(false)
			})

			newSocket.on('reconnect', (attempt) => {
				console.log('Socket reconnected after', attempt, 'attempts')
				setIsConnected(true)
			})

			newSocket.on('reconnect_attempt', (attempt) => {
				console.log('Socket reconnection attempt:', attempt)
			})

			newSocket.on('reconnect_error', (error) => {
				console.error('Socket reconnection error:', error)
			})

			newSocket.on('reconnect_failed', () => {
				console.error('Socket reconnection failed')
			})

			setSocket(newSocket)

			return () => {
				newSocket.disconnect()
				setIsConnected(false)
				setSocket(null)
			}
		} catch (error) {
			console.error('Error al inicializar Socket.io:', error)
			setIsConnected(false)
			return () => {}
		}
	}

	const reconnect = () => {
		if (socket) {
			socket.disconnect()
			socket.connect()
		} else {
			setupSocket()
		}
	}

	useEffect(() => {
		const cleanup = setupSocket()
		return () => {
			if (cleanup) cleanup()
		}
	}, [token, user?.id, isAuthenticated])

	useEffect(() => {
		const handleOnline = () => {
			console.log('Browser is online, reconnecting socket')
			reconnect()
		}

		window.addEventListener('online', handleOnline)
		return () => {
			window.removeEventListener('online', handleOnline)
		}
	}, [socket])

	return (
		<SocketContext.Provider value={{ socket, isConnected, reconnect }}>
			{children}
		</SocketContext.Provider>
	)
}
