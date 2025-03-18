/**
 * Utility functions for token handling
 */

// Function to decode JWT payload
export const decodeToken = (token: string) => {
	try {
		// Split the token by dots
		const parts = token.split('.')
		if (parts.length !== 3) {
			throw new Error('Not a valid JWT token format')
		}

		// Get the payload part (the middle part)
		const payload = parts[1]

		// Base64Url decode
		const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map(
					(c) =>
						'%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2),
				)
				.join(''),
		)

		return JSON.parse(jsonPayload)
	} catch (e) {
		console.error('Error decoding token:', e)
		return null
	}
}

// Function to check if token is expired
export const isTokenExpired = (token: string) => {
	try {
		const decodedToken = decodeToken(token)
		if (!decodedToken || !decodedToken.exp) return true

		// exp is in seconds, Date.now() is in milliseconds
		const expirationTime = decodedToken.exp * 1000
		const currentTime = Date.now()

		console.log('Token expiration check:', {
			expirationTime: new Date(expirationTime).toLocaleString(),
			currentTime: new Date(currentTime).toLocaleString(),
			isExpired: currentTime > expirationTime,
		})

		return currentTime > expirationTime
	} catch (e) {
		console.error('Error checking token expiration:', e)
		return true
	}
}

// Function to get token info for debugging
export const getTokenInfo = (token: string | null) => {
	if (!token) return { valid: false, message: 'No token provided' }

	try {
		const decoded = decodeToken(token)
		if (!decoded) return { valid: false, message: 'Could not decode token' }

		const expired = isTokenExpired(token)

		return {
			valid: !expired,
			decoded,
			expired,
			message: expired ? 'Token has expired' : 'Token is valid',
		}
	} catch (e) {
		return { valid: false, message: 'Error processing token' }
	}
}

// Expose a function to check the current token in localStorage
export const checkCurrentToken = () => {
	const token = localStorage.getItem('auth-token')
	console.log(
		'Current token in localStorage:',
		token ? token.substring(0, 20) + '...' : 'none',
	)

	if (token) {
		const tokenInfo = getTokenInfo(token)
		console.log('Token info:', tokenInfo)
		return tokenInfo
	}

	return { valid: false, message: 'No token in localStorage' }
}
