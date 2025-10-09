<<<<<<< HEAD
import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);

export { client };

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const COLLECTIONS = {
  CONNECTIONS: process.env.NEXT_PUBLIC_APPWRITE_CONNECTIONS_COLLECTION_ID!,
  AUTOMATIONS: process.env.NEXT_PUBLIC_APPWRITE_AUTOMATIONS_COLLECTION_ID!,
  YOUTUBE_SUBSCRIPTIONS: process.env.NEXT_PUBLIC_APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID!,
};
=======
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
>>>>>>> 2833f3e098ddf8b7445210d2257d2d4d238b8235
