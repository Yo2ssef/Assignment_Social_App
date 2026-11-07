import { resolve } from 'node:path';
import { config } from 'dotenv';
export const NODE_ENV: string = process.env.NODE_ENV ?? "development";
config({ path: resolve(`.env.${NODE_ENV}`) })

export const PORT: number = parseInt(process.env.PORT ?? "9000", 10)
export const APP_EMAIL: string = process.env.APP_EMAIL as string
export const APP_PASSWORD: string = process.env.APP_PASSWORD as string
export const APP_NAME: string = process.env.APP_NAME as string

export const DB_URI: string = process.env.DB_URI as string
export const REDIS_URI: string = process.env.REDIS_URI as string

export const ENC_KEY: string = process.env.ENC_KEY as string
export const IV_LENGTH: number = parseInt(process.env.IV_LENGTH ?? "16", 10)

export const USER_ACCESS_TOKEN_SIGNATURE: string = process.env.USER_ACCESS_TOKEN_SIGNATURE as string
export const USER_REFRESH_TOKEN_SIGNATURE: string = process.env.USER_REFRESH_TOKEN_SIGNATURE as string

export const ADMIN_ACCESS_TOKEN_SIGNATURE: string = process.env.ADMIN_ACCESS_TOKEN_SIGNATURE as string
export const ADMIN_REFRESH_TOKEN_SIGNATURE: string = process.env.ADMIN_REFRESH_TOKEN_SIGNATURE as string

export const ACCESS_TOKEN_EXPIRES_IN: number = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1800", 10)
export const REFRESH_TOKEN_EXPIRES_IN: number = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "86400", 10)

export const WEB_CLIENT_ID: string = process.env.WEB_CLIENT_ID as string
export const ORIGINS: string[] = process.env.ORIGINS?.split(",") || []

export const AWS_REGION: string = process.env.AWS_REGION as string
export const AWS_BUCKET_NAME: string = process.env.AWS_BUCKET_NAME as string
export const AWS_ACCESS_KEY_ID: string = process.env.AWS_ACCESS_KEY_ID as string
export const AWS_SECRET_ACCESS_KEY: string = process.env.AWS_SECRET_ACCESS_KEY as string
