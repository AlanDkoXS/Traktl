export interface VerificationToken {
	token: string;
	expiresAt: Date;
}

export interface UserVerification {
	isVerified: boolean;
	verificationToken?: VerificationToken;
}
