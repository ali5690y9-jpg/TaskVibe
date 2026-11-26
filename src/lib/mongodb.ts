import "server-only";
import { MongoClient, type Db } from "mongodb";
import { env } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var taskVibeMongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

function getClientPromise() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured for TaskVibe.");
  }

  if (process.env.NODE_ENV === "development") {
    global.taskVibeMongoClientPromise ??= new MongoClient(env.MONGODB_URI).connect();
    return global.taskVibeMongoClientPromise;
  }

  clientPromise ??= new MongoClient(env.MONGODB_URI).connect();
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(env.MONGODB_DB);
}
