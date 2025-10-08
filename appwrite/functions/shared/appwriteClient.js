import { Client, Databases, Functions } from "node-appwrite";
import { env } from "./env.js";

let cachedClient;

export function getAdminClient() {
  if (cachedClient) return cachedClient;

  const client = new Client()
    .setEndpoint(env.endpoint())
    .setProject(env.projectId())
    .setKey(env.apiKey());

  cachedClient = {
    client,
    databases: new Databases(client),
    functions: new Functions(client),
  };

  return cachedClient;
}
