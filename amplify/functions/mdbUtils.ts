import { Collection, Db, MongoClient } from "mongodb";
import "dotenv/config";

// Environment variables
const ATLAS_CONNECTION_STRING = process.env.ATLAS_CONNECTION_STRING as string;
const COLLECTION_NAME = process.env.COLLECTION_NAME as string;
const DB_NAME = process.env.DB_NAME as string;

export function connectToMongodb(): [MongoClient, Db, Collection] {
  const client = new MongoClient(ATLAS_CONNECTION_STRING);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  return [client, db, collection];
}
