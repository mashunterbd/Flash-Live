import { Client, Account, Teams, Databases, Storage } from 'appwrite';

const DEFAULT_ENDPOINT = 'https://appwrite.doitfastit.de/v1';
const DEFAULT_PROJECT_ID = 'flashlive';

export const appwriteClient = new Client()
  .setEndpoint(DEFAULT_ENDPOINT)
  .setProject(DEFAULT_PROJECT_ID);

export const accountService = new Account(appwriteClient);
export const teamsService = new Teams(appwriteClient);
export const databasesService = new Databases(appwriteClient);
export const storageService = new Storage(appwriteClient);

// Update configuration dynamically from backend /api/config
export async function syncClientConfig(): Promise<void> {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data.appwrite?.endpoint) appwriteClient.setEndpoint(data.appwrite.endpoint);
      if (data.appwrite?.projectId) appwriteClient.setProject(data.appwrite.projectId);
    }
  } catch {
    // Retain defaults if server unreachable
  }
}
