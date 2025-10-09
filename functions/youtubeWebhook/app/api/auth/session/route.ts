import { headers } from "next/headers";
import { NextResponse } from "next/server";

type SessionResponse = {
	userId: string;
	sessionToken?: string;
	experienceId?: string;
	experienceRoute?: string;
	companyId?: string;
	companyRoute?: string;
	viewType?: string;
};

export async function GET() {
	const headerList = headers();
	const userId = headerList.get("x-whop-user-id");

	if (!userId) {
		return NextResponse.json({ error: "WHOP_SESSION_NOT_FOUND" }, { status: 401 });
	}

	const payload: SessionResponse = {
		userId,
		sessionToken: headerList.get("x-whop-session-token") ?? undefined,
		experienceId: headerList.get("x-whop-experience-id") ?? undefined,
		experienceRoute: headerList.get("x-whop-experience-route") ?? undefined,
		companyId: headerList.get("x-whop-company-id") ?? undefined,
		companyRoute: headerList.get("x-whop-company-route") ?? undefined,
		viewType: headerList.get("x-whop-view-type") ?? undefined,
	};

	return NextResponse.json(payload, {
		headers: {
			"cache-control": "no-store, max-age=0",
		},
	});
}
