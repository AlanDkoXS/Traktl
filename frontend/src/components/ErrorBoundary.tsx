import React, { Component, ErrorInfo, ReactNode } from 'react'
import { useError } from '../context/ErrorContext'

interface Props {
	children: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
	}

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Uncaught error:', error, errorInfo)
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex items-center justify-center bg-gray-100">
					<div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
						<h2 className="text-2xl font-bold text-red-600 mb-4">
							Something went wrong
						</h2>
						<p className="text-gray-600 mb-4">
							{this.state.error?.message ||
								'An unexpected error occurred'}
						</p>
						<button
							className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
							onClick={() => window.location.reload()}
						>
							Reload Page
						</button>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}

export const GlobalError: React.FC = () => {
	const { error, clearError } = useError()

	if (!error) return null

	return (
		<div className="fixed top-4 right-4 z-50">
			<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
				<span className="block sm:inline">{error}</span>
				<button
					className="absolute top-0 bottom-0 right-0 px-4 py-3"
					onClick={clearError}
				>
					<span className="sr-only">Dismiss</span>
					<svg
						className="fill-current h-4 w-4"
						role="button"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
					>
						<title>Close</title>
						<path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
					</svg>
				</button>
			</div>
		</div>
	)
}
