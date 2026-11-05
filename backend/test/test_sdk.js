import { Client, Users } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);
try {
  const u = await users.get('6aec33ab0023e440f804');
  console.log('User found via SDK:', u['$id'], u.email, u.labels);
} catch (e) {
  console.error('node-appwrite error details:', e);
}

