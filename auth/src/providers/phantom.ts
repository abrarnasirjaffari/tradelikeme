import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, APIError, isAPIError } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { ed25519 } from "@noble/curves/ed25519.js";
import * as z from "zod";

const PACKAGE_VERSION = "1.6.9";

declare module "better-auth" {
  interface BetterAuthPluginRegistry<AuthOptions, Options> {
    phantom: {
      creator: typeof phantom;
    };
  }
}

// Decode base58 wallet address to bytes
function decodeBase58(encoded: string): Uint8Array {
  const ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const BASE = 58n;
  const bytes: number[] = [];
  let value = 0n;

  for (const char of encoded) {
    const digit = ALPHABET.indexOf(char);
    if (digit < 0) throw new Error(`Invalid base58 char: ${char}`);
    value = value * BASE + BigInt(digit);
  }

  // Convert bigint to bytes
  let hex = value.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  for (let i = 0; i < hex.length; i += 2)
    bytes.push(parseInt(hex.slice(i, i + 2), 16));

  // Leading zeros from base58 '1' characters
  for (const char of encoded) {
    if (char !== "1") break;
    bytes.unshift(0);
  }

  return new Uint8Array(bytes);
}

function verifyEd25519(
  message: string,
  signatureBase58: string,
  walletAddress: string,
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = decodeBase58(signatureBase58);
    const publicKeyBytes = decodeBase58(walletAddress);
    return ed25519.verify(signatureBytes, messageBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

const BASE58_REGEX = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{32,44}$/;

export const phantom = (): BetterAuthPlugin =>
  ({
    id: "phantom",
    version: PACKAGE_VERSION,

    endpoints: {
      phantomNonce: createAuthEndpoint(
        "/phantom/nonce",
        {
          method: "POST",
          body: z.object({
            walletAddress: z.string().regex(BASE58_REGEX),
          }),
        },
        async (ctx) => {
          const { walletAddress } = ctx.body;
          const nonce = crypto.randomUUID().replace(/-/g, "");
          // Store nonce bound to this specific wallet address (15 min expiry)
          await ctx.context.internalAdapter.createVerificationValue({
            identifier: `phantom:nonce:${walletAddress}:${nonce}`,
            value: walletAddress,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          });
          return ctx.json({ nonce });
        },
      ),

      phantomVerify: createAuthEndpoint(
        "/phantom/verify",
        {
          method: "POST",
          body: z.object({
            walletAddress: z.string().regex(BASE58_REGEX),
            signature: z.string().regex(BASE58_REGEX),
            message: z.string().min(1),
            nonce: z.string().min(1),
          }),
          requireRequest: true,
        },
        async (ctx) => {
          const { walletAddress, signature, message, nonce } = ctx.body;

          try {
            // Verify nonce is valid, unexpired, and bound to this wallet address
            const verification =
              await ctx.context.internalAdapter.findVerificationValue(
                `phantom:nonce:${walletAddress}:${nonce}`,
              );

            if (!verification || new Date() > verification.expiresAt) {
              throw APIError.fromStatus("UNAUTHORIZED", {
                message: "Invalid or expired nonce",
                status: 401,
                code: "PHANTOM_INVALID_NONCE",
              });
            }

            // Verify nonce was issued for this specific wallet address
            if (verification.value !== walletAddress) {
              throw APIError.fromStatus("UNAUTHORIZED", {
                message: "Nonce not issued for this wallet",
                status: 401,
                code: "PHANTOM_WALLET_MISMATCH",
              });
            }

            // Nonce in message must match stored nonce
            if (!message.includes(nonce)) {
              throw APIError.fromStatus("UNAUTHORIZED", {
                message: "Nonce mismatch",
                status: 401,
                code: "PHANTOM_NONCE_MISMATCH",
              });
            }

            // Verify Ed25519 signature
            const valid = verifyEd25519(message, signature, walletAddress);
            if (!valid) {
              throw APIError.fromStatus("UNAUTHORIZED", {
                message: "Invalid signature",
                status: 401,
                code: "PHANTOM_INVALID_SIGNATURE",
              });
            }

            // Consume the nonce (single-use)
            await ctx.context.internalAdapter.deleteVerificationByIdentifier(
              `phantom:nonce:${walletAddress}:${nonce}`,
            );

            // Find existing account for this wallet
            const existingAccount = await ctx.context.adapter.findOne<{
              userId: string;
              providerId: string;
              accountId: string;
            }>({
              model: "account",
              where: [
                { field: "providerId", operator: "eq", value: "phantom" },
                { field: "accountId", operator: "eq", value: walletAddress },
              ],
            });

            let userId: string;

            if (existingAccount) {
              userId = existingAccount.userId;
            } else {
              // Create new user + account for this wallet
              const newUser = await ctx.context.internalAdapter.createUser({
                name: `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
                email: `${walletAddress}@phantom.invalid`,
                emailVerified: false,
                walletAddress,
              });

              await ctx.context.internalAdapter.createAccount({
                userId: newUser.id,
                providerId: "phantom",
                accountId: walletAddress,
                createdAt: new Date(),
                updatedAt: new Date(),
              });

              userId = newUser.id;
            }

            const user = await ctx.context.adapter.findOne<{
              id: string;
              name: string;
              email: string;
              walletAddress?: string;
            }>({
              model: "user",
              where: [{ field: "id", operator: "eq", value: userId }],
            });

            if (!user) {
              throw APIError.fromStatus("INTERNAL_SERVER_ERROR", {
                message: "User not found after creation",
                status: 500,
              });
            }

            const session =
              await ctx.context.internalAdapter.createSession(userId);

            if (!session) {
              throw APIError.fromStatus("INTERNAL_SERVER_ERROR", {
                message: "Failed to create session",
                status: 500,
              });
            }

            await setSessionCookie(ctx, { session, user });

            return ctx.json({
              token: session.token,
              user: {
                id: user.id,
                walletAddress,
              },
            });
          } catch (error: unknown) {
            if (isAPIError(error)) throw error;
            throw APIError.fromStatus("UNAUTHORIZED", {
              message: "Authentication failed",
              error: error instanceof Error ? error.message : "Unknown error",
              status: 401,
            });
          }
        },
      ),
    },
  }) satisfies BetterAuthPlugin;
