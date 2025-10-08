import { NextRequest } from "next/server";
import { Query, ID, Models } from "node-appwrite";
import { DateTime } from "luxon";
import { appwriteAdmin } from "./appwrite";
import { env } from "./env";
import { whopSdk } from "./whop-sdk";

type PlanTier = "free" | "pro" | "enterprise";

export class AuthenticationError extends Error {
	readonly status: number;

	constructor(message: string, status = 401) {
		super(message);
		this.name = "AuthenticationError";
		this.status = status;
	}
}

export interface AuthenticatedUserContext {
	whopUserId: string;
	planTier: PlanTier;
	timezone: string;
	appwriteUser: AppwriteUserDocument;
}

type AppwriteUserDocument = Models.Document & Record<string, unknown>;

function coerceBoolean(value: unknown): boolean {
	if (typeof value === "boolean") {
		return value;
	}
	if (value && typeof value === "object") {
		const candidate = value as { hasAccess?: boolean; _error?: unknown };
		if (candidate._error instanceof Error) {
			throw candidate._error;
		}
		if ("hasAccess" in candidate) {
			return Boolean(candidate.hasAccess);
		}
	}
	return Boolean(value);
}

async function ensureWhopAccess(userId: string): Promise<void> {
	try {
		const result = await whopSdk.access.checkIfUserHasAccessToCompany({
			companyId: env.whopCompanyId(),
			userId,
		});
		if (!coerceBoolean(result)) {
			throw new AuthenticationError("Whop entitlement missing", 403);
		}
	} catch (error) {
		if (error instanceof AuthenticationError) {
			throw error;
		}
		throw new AuthenticationError(
			error instanceof Error ? error.message : "Failed to validate Whop access",
			error instanceof AuthenticationError ? error.status : 401,
		);
	}
}

async function resolvePlanTier(userId: string): Promise<PlanTier> {
	const enterprisePass = env.whopEnterpriseAccessPassId();
	const proPass = env.whopProAccessPassId();

	if (enterprisePass) {
		try {
			const hasEnterprise = await whopSdk.access.checkIfUserHasAccessToAccessPass({
				accessPassId: enterprisePass,
				userId,
			});
			if (coerceBoolean(hasEnterprise)) {
				return "enterprise";
			}
		} catch (error) {
			console.error("Failed to verify enterprise entitlement", error);
		}
	}

	if (proPass) {
		try {
			const hasPro = await whopSdk.access.checkIfUserHasAccessToAccessPass({
				accessPassId: proPass,
				userId,
			});
			if (coerceBoolean(hasPro)) {
				return "pro";
			}
		} catch (error) {
			console.error("Failed to verify pro entitlement", error);
		}
	}

	return "free";
}

async function upsertAppwriteUser(whopUserId: string, planTier: PlanTier): Promise<AppwriteUserDocument> {
	const { databases, databaseId, collections } = appwriteAdmin;

	const { documents } = await databases.listDocuments(
		databaseId,
		collections.users,
		[Query.equal("whopUserId", [whopUserId]), Query.limit(1)],
	);

	const now = DateTime.utc().toISO();

	if (documents.length > 0) {
		const existing = documents[0] as AppwriteUserDocument;
		const updates: Record<string, unknown> = {};
		if (existing.planTier !== planTier) {
			updates.planTier = planTier;
		}
		if (!existing.timezone) {
			updates.timezone = env.defaultTimezone();
		}
		if (Object.keys(updates).length > 0) {
			updates.updatedAt = now;
			return databases.updateDocument(databaseId, collections.users, existing.$id, updates as Record<string, unknown>) as Promise<AppwriteUserDocument>;
		}
		return existing;
	}

	return databases.createDocument(databaseId, collections.users, ID.unique(), {
		whopUserId,
		planTier,
		timezone: env.defaultTimezone(),
		createdAt: now,
		updatedAt: now,
	} as Record<string, unknown>) as Promise<AppwriteUserDocument>;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUserContext> {
	const verification = await whopSdk
		.verifyUserToken(request)
		.catch((error) => {
			throw new AuthenticationError(
				error instanceof Error ? error.message : "Invalid Whop user token",
				401,
			);
		});

	if (!verification?.userId) {
		throw new AuthenticationError("Missing Whop user identifier", 401);
	}

	const whopUserId = verification.userId;

	await ensureWhopAccess(whopUserId);

	const planTier = await resolvePlanTier(whopUserId);
	const appwriteUser = await upsertAppwriteUser(whopUserId, planTier);
	const timezone = (appwriteUser.timezone as string | undefined) ?? env.defaultTimezone();

	return {
		whopUserId,
		planTier,
		timezone,
		appwriteUser,
	};
}
