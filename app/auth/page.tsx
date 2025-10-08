import type { Metadata } from "next";
import { AuthLanding } from "@/components/auth/auth-landing";

export const metadata: Metadata = {
	title: "AmpFlow • Sign in",
	description: "Authenticate with Whop to access your AmpFlow automations.",
};

export default function AuthPage() {
	return <AuthLanding />;
}
