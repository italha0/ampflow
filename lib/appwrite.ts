import { Client, Databases, Functions, Storage, Users } from "node-appwrite";
import { env } from "./env";

let client: Client | null = null;

function getClient() {
	if (client) {
		return client;
	}

	client = new Client()
		.setEndpoint(env.appwriteEndpoint())
		.setProject(env.appwriteProjectId())
		.setKey(env.appwriteApiKey());

	return client;
}

export const appwriteAdmin = {
	get client() {
		return getClient();
	},
	get databases() {
		return new Databases(getClient());
	},
	get functions() {
		return new Functions(getClient());
	},
	get storage() {
		return new Storage(getClient());
	},
	get users() {
		return new Users(getClient());
	},
	collections: {
		users: env.appwriteUsersCollectionId(),
		posts: env.appwritePostsCollectionId(),
		automations: env.appwriteAutomationsCollectionId(),
		logs: env.appwriteLogsCollectionId(),
		connections: env.appwriteConnectionsCollectionId(),
		youtubeSubscriptions: env.appwriteYoutubeSubscriptionsCollectionId(),
	},
	databaseId: env.appwriteDatabaseId(),
	functionIds: {
		postToInstagram: env.appwritePostFunctionId(),
		distributeMessage: env.appwriteDistributeMessageFunctionId(),
		subscribeToYouTube: env.appwriteSubscribeYoutubeFunctionId(),
		authRedirect: env.appwriteAuthRedirectFunctionId(),
	},
};

export type AppwriteCollections = typeof appwriteAdmin.collections;
