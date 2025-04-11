export const isValidObjectId = (id: string | undefined | null): boolean => {
	if (!id) return false

	// Basic check: 24 character hex string
	const objectIdPattern = /^[0-9a-fA-F]{24}$/
	if (!objectIdPattern.test(id)) return false

	// Additional validation for MongoDB ObjectId structure:
	// Extract the timestamp part (first 8 characters)
	const timestampHex = id.substring(0, 8)
	const timestamp = parseInt(timestampHex, 16)

	// Check if timestamp is reasonable (after Jan 1, 2000 and before some future date)
	const minTimestamp = 946684800 // Jan 1, 2000
	const maxTimestamp = Math.floor(Date.now() / 1000) + 86400 * 365 // Now + 1 year

	if (timestamp < minTimestamp || timestamp > maxTimestamp) {
		return false
	}

	return true
}

export const toObjectIdOrUndefined = (
	value: string | undefined | null,
): string | undefined => {
	if (!value || value === '') return undefined
	if (isValidObjectId(value)) {
		return value
	}
	console.warn(
		`Invalid ObjectId format: "${value}" - converting to undefined`,
	)
	return undefined
}

export const toObjectIdOrNull = (
	value: string | undefined | null,
): string | null => {
	if (!value || value === '') return null
	if (isValidObjectId(value)) {
		return value
	}
	return null
}
