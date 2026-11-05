import { Client, Users, Teams, Databases, Messaging, Storage } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Ensure .env is loaded whether run from root or backend folder
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../../.env')
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://appwrite.doitfastit.de/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || 'flashlive';
const apiKey = process.env.APPWRITE_API_KEY || '';

if (!apiKey) {
  console.warn('[AppwriteService] Warning: APPWRITE_API_KEY is not configured in backend/.env');
}

// Server SDK Client (uses Admin API key)
export const appwriteServerClient = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

export const usersService = new Users(appwriteServerClient);
export const teamsService = new Teams(appwriteServerClient);
export const databasesService = new Databases(appwriteServerClient);
export const messagingService = new Messaging(appwriteServerClient);
export const storageService = new Storage(appwriteServerClient);

export const APPWRITE_CONFIG = {
  endpoint,
  projectId,
  databaseId: process.env.APPWRITE_DATABASE_ID || 'flashlive_main',
  collections: {
    organizations: 'organizations',
    connectedChannels: 'connected_channels',
    streamSessions: 'stream_sessions',
    emailProviders: 'email_provider_configs',
    activityLogs: 'activity_logs'
  }
};
