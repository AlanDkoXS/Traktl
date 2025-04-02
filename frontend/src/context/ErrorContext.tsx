import React, { createContext, useContext, useState, useCallback } from 'react'
import { ApiResponse } from '../types'

interface ErrorContextType {
	error: string | null
	setError: (error: string | null) => void
	handleApiError: <T>(response: ApiResponse<T>) => void
	clearError: () => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [error, setError] = useState<string | null>(null)

	const handleApiError = useCallback(<T,>(response: ApiResponse<T>) => {
		if (!response.success) {
			setError(response.error || 'An unexpected error occurred')
		} else {
			setError(null)
		}
	}, [])

	const clearError = useCallback(() => {
		setError(null)
	}, [])

	return (
		<ErrorContext.Provider
			value={{ error, setError, handleApiError, clearError }}
		>
			{children}
		</ErrorContext.Provider>
	)
}

export const useError = () => {
	const context = useContext(ErrorContext)
	if (context === undefined) {
		throw new Error('useError must be used within an ErrorProvider')
	}
	return context
}
