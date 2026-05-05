import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // set in Vercel env vars
let client;
let db;

export async function getDb() {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(process.env.MONGODB_DB || 'streamit');
  return db;
}