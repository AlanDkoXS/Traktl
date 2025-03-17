export interface emailEmailVerificationToken {
	token: string;
	expiresAt: Date;
}

export interface UserVerification {
	isVerified: boolean;
	emailEmailVerificationToken?: emailEmailVerificationToken;
}
