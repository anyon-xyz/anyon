import { z } from 'zod';

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
declare const server: z.ZodObject<{
    NODE_ENV: z.ZodEnum<["development", "test", "production"]>;
    DATABASE_URL: z.ZodString;
    STEAM_API_KEY: z.ZodString;
    STEAM_APIS_KEY: z.ZodString;
    STEAM_ACCOUNT_NAME: z.ZodString;
    STEAM_PASSWORD: z.ZodString;
    STEAM_SHARED_SECRET: z.ZodString;
    STEAM_IDENTITY_SECRET: z.ZodString;
    STEAM_MACHINE_NAME: z.ZodOptional<z.ZodString>;
    SECRET: z.ZodString;
    REDIS_URL: z.ZodString;
}, "strip", z.ZodTypeAny, {
    STEAM_MACHINE_NAME?: string | undefined;
    NODE_ENV: "development" | "test" | "production";
    DATABASE_URL: string;
    STEAM_API_KEY: string;
    STEAM_APIS_KEY: string;
    STEAM_ACCOUNT_NAME: string;
    STEAM_PASSWORD: string;
    STEAM_SHARED_SECRET: string;
    STEAM_IDENTITY_SECRET: string;
    SECRET: string;
    REDIS_URL: string;
}, {
    STEAM_MACHINE_NAME?: string | undefined;
    NODE_ENV: "development" | "test" | "production";
    DATABASE_URL: string;
    STEAM_API_KEY: string;
    STEAM_APIS_KEY: string;
    STEAM_ACCOUNT_NAME: string;
    STEAM_PASSWORD: string;
    STEAM_SHARED_SECRET: string;
    STEAM_IDENTITY_SECRET: string;
    SECRET: string;
    REDIS_URL: string;
}>;
/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
declare const client: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**********************************/
/**********************************/
declare const merged: z.ZodObject<Omit<{
    NODE_ENV: z.ZodEnum<["development", "test", "production"]>;
    DATABASE_URL: z.ZodString;
    STEAM_API_KEY: z.ZodString;
    STEAM_APIS_KEY: z.ZodString;
    STEAM_ACCOUNT_NAME: z.ZodString;
    STEAM_PASSWORD: z.ZodString;
    STEAM_SHARED_SECRET: z.ZodString;
    STEAM_IDENTITY_SECRET: z.ZodString;
    STEAM_MACHINE_NAME: z.ZodOptional<z.ZodString>;
    SECRET: z.ZodString;
    REDIS_URL: z.ZodString;
}, never>, "strip", z.ZodTypeAny, {
    STEAM_MACHINE_NAME?: string | undefined;
    NODE_ENV: "development" | "test" | "production";
    DATABASE_URL: string;
    STEAM_API_KEY: string;
    STEAM_APIS_KEY: string;
    STEAM_ACCOUNT_NAME: string;
    STEAM_PASSWORD: string;
    STEAM_SHARED_SECRET: string;
    STEAM_IDENTITY_SECRET: string;
    SECRET: string;
    REDIS_URL: string;
}, {
    STEAM_MACHINE_NAME?: string | undefined;
    NODE_ENV: "development" | "test" | "production";
    DATABASE_URL: string;
    STEAM_API_KEY: string;
    STEAM_APIS_KEY: string;
    STEAM_ACCOUNT_NAME: string;
    STEAM_PASSWORD: string;
    STEAM_SHARED_SECRET: string;
    STEAM_IDENTITY_SECRET: string;
    SECRET: string;
    REDIS_URL: string;
}>;
type Env = z.infer<typeof merged>;
declare function getEnv<TKeys extends (keyof Env)[]>(keys: TKeys): {
    [K in TKeys[number]]: Env[K];
};

export { client, getEnv, server };
