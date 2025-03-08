import 'dotenv/config'
import { get } from 'env-var'

export const envs = {
    // Server
    PORT: get('PORT').default(4000).asPortNumber(),
    APP_NAME: get('APP_NAME').default('traktl').asString(),

    // MongoDB
    MONGODB_URI: get('MONGODB_URI').required().asString(),
    DATABASE_NAME: get('DATABASE_NAME').required().asString(),
    USERNAME_DATABASE: get('USERNAME_DATABASE').required().asString(),
    PASSWORD_DATABASE: get('PASSWORD_DATABASE').required().asString(),

    // JWT
    JWT_SEED: get('JWT_SEED').required().asString(),
    JWT_EXPIRE_IN: get('JWT_EXPIRE_IN').default('30d').asString(),

    // Google OAuth
    GOOGLE_CLIENT_ID: get('GOOGLE_CLIENT_ID').required().asString(),
    GOOGLE_CLIENT_SECRET: get('GOOGLE_CLIENT_SECRET').required().asString(),

    // Environment
    NODE_ENV: get('NODE_ENV').default('development').asString(),
}
