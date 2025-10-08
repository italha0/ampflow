import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, AuthenticationError } from "@/lib/auth";
import type { AmpFlowUser, ApiError } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<AmpFlowUser | ApiError>> {
	try {
		const { appwriteUser, planTier, timezone, whopUserId } = await authenticateRequest(request);

		const user: AmpFlowUser = {
			$id: appwriteUser.$id,
			whopUserId,
			planTier,
			instagramBusinessId: (appwriteUser.instagramBusinessId as string | undefined) ?? undefined,
			timezone,
		};

		return NextResponse.json(user);
	} catch (error) {
		if (error instanceof AuthenticationError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		console.error("Failed to load user", error);
		return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
	}
}
