import * as dotenv from 'dotenv';
dotenv.config();

export const TELEGRAM_BOT_SECRET = process.env.TELEGRAM_BOT_SECRET;
export const WEBHOOK_URL = process.env.WEBHOOK_URL;
export const PORT = Number(process.env.PORT) || 5000;

export const WEB_URL = process.env.WEB_URL || '';
export const WEB_PAYLOAD_KEY = process.env.WEB_PAYLOAD_KEY || 'payload';
export const WEB_SIGNATURE_KEY = process.env.WEB_SIGNATURE_KEY || 'signature';

export const AUTH_PAYLOAD_SECRET = process.env.AUTH_PAYLOAD_SECRET;
export const AUTH_MESSAGE_TIMEOUT = Number(process.env.AUTH_MESSAGE_TIMEOUT) || 30000;

export const SOCKS_PROXY = process.env.SOCKS_PROXY;
