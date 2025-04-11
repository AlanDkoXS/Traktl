import 'dotenv/config'
import { get } from 'env-var'

export const envs = {
	PORT: get('PORT').default(4000).asPortNumber(),
	APP_NAME: get('APP_NAME').default('traktl').asString(),

	MONGODB_URI: get('MONGODB_URI').required().asString(),
	DATABASE_NAME: get('DATABASE_NAME').required().asString(),
	USERNAME_DATABASE: get('USERNAME_DATABASE').required().asString(),
	PASSWORD_DATABASE: get('PASSWORD_DATABASE').required().asString(),

	JWT_SEED: get('JWT_SEED').required().asString(),
	JWT_EXPIRE_IN: get('JWT_EXPIRE_IN').default('30d').asString(),

	GOOGLE_CLIENT_ID: get('GOOGLE_CLIENT_ID').required().asString(),
	GOOGLE_CLIENT_SECRET: get('GOOGLE_CLIENT_SECRET').required().asString(),

	FRONTEND_URL: get('FRONTEND_URL')
		.default('http://localhost:5173')
		.asString(),

	NODE_ENV: get('NODE_ENV').default('development').asString(),

	isProduction:
		get('NODE_ENV').default('development').asString() === 'production',
}
