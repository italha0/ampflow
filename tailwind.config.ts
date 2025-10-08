import type { Config } from "tailwindcss";
import { frostedThemePlugin } from "@whop/react/tailwind";

const config: Config = {
	content: [
		"./app/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./lib/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	plugins: [frostedThemePlugin()],
};

export default config;
