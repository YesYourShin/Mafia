import { VerifyCallback } from 'passport-google-oauth20';

export type noTypeVerifyCallback = (error: any, user?: any, info?: any) => void;
export type oauthVerifyCallback = noTypeVerifyCallback | VerifyCallback;
