import { WhopServerSdk } from "@whop/api";
import { env } from "./env";

export const whopSdk = WhopServerSdk({
	appId: env.whopAppId(),
	appApiKey: env.whopApiKey(),
	onBehalfOfUserId: env.whopAgentUserId(),
	companyId: env.whopCompanyId(),
});
