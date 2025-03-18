export interface EmailVerificationToken {
	token: string
	expiresAt: Date
}

export interface UserVerification {
	isVerified: boolean
	emailVerificationToken?: EmailVerificationToken
}
