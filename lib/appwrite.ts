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
