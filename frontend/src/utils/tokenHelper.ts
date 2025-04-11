export const decodeToken = (token: string) => {
	try {
		const parts = token.split('.')
		if (parts.length !== 3) {
			throw new Error('Not a valid JWT token format')
		}

		const payload = parts[1]

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

export const isTokenExpired = (token: string) => {
	try {
		const decodedToken = decodeToken(token)
		if (!decodedToken || !decodedToken.exp) return true

		const expirationTime = decodedToken.exp * 1000
		const currentTime = Date.now()

		console.log('Token expiration check:', {
			expirationTime: new Date(expirationTime).toLocaleString(),
			currentTime: new Date(currentTime).toLocaleString(),
			isExpired: currentTime > expirationTime,
		})

		return currentTime > expirationTime
	} catch {
		console.error('Error checking token expiration')
		return true
	}
}

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
	} catch {
		return { valid: false, message: 'Error processing token' }
	}
}

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
