import { databasesService, APPWRITE_CONFIG } from './appwrite.js';
import { Permission, Role } from 'node-appwrite';
import { backendErrorLogger } from '../utils/errorLogger.js';

export async function ensureDatabaseAndCollections(): Promise<void> {
  const dbId = APPWRITE_CONFIG.databaseId;

  // 1. Ensure Database exists
  try {
    await databasesService.get(dbId);
  } catch (err: any) {
    if (err.code === 404) {
      await databasesService.create(dbId, 'Flash Live Main Database');
    }
  }

  // Helper to ensure collection exists
  async function ensureCollection(collId: string, name: string) {
    try {
      await databasesService.getCollection(dbId, collId);
    } catch (err: any) {
      if (err.code === 404) {
        await databasesService.createCollection(dbId, collId, name, [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]);
      }
    }
  }

  // Helper to ensure string attribute exists
  async function ensureStringAttr(collId: string, key: string, size = 255, required = false, isArray = false) {
    try {
      await databasesService.createStringAttribute(dbId, collId, key, size, required, undefined, isArray);
      console.log(`[Database] Attribute '${collId}.${key}' created.`);
    } catch (err: any) {
      if (err.code !== 409) { // 409 means already exists
        backendErrorLogger.log('warning', `Attribute error for ${key}: ${err.message}`, 'dbInit');
      }
    }
  }

  try {
    await ensureCollection(APPWRITE_CONFIG.collections.connectedChannels, 'Connected Channels');
    await ensureStringAttr(APPWRITE_CONFIG.collections.connectedChannels, 'orgId', 128, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.connectedChannels, 'platform', 64, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.connectedChannels, 'externalId', 255, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.connectedChannels, 'name', 255, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.connectedChannels, 'logoUrl', 1024, false);
    await ensureStringAttr(APPWRITE_CONFIG.collections.connectedChannels, 'accessToken', 2048, false);
    await ensureStringAttr(APPWRITE_CONFIG.collections.connectedChannels, 'permissions', 128, false, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.connectedChannels, 'connectedAt', 64, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.connectedChannels, 'status', 64, false);

    await ensureCollection(APPWRITE_CONFIG.collections.organizations, 'Organizations');
    await ensureStringAttr(APPWRITE_CONFIG.collections.organizations, 'teamId', 128, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.organizations, 'name', 255, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.organizations, 'connectionLimit', 32, false);
    await ensureStringAttr(APPWRITE_CONFIG.collections.organizations, 'status', 64, false);
    await ensureStringAttr(APPWRITE_CONFIG.collections.organizations, 'suspendedAt', 64, false);

    await ensureCollection(APPWRITE_CONFIG.collections.streamSessions, 'Stream Sessions');
    await ensureStringAttr(APPWRITE_CONFIG.collections.streamSessions, 'orgId', 128, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.streamSessions, 'ingestUrl', 255, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.streamSessions, 'streamKey', 128, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.streamSessions, 'title', 255, false);
    await ensureStringAttr(APPWRITE_CONFIG.collections.streamSessions, 'destinations', 128, false, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.streamSessions, 'status', 64, false);
    await ensureStringAttr(APPWRITE_CONFIG.collections.streamSessions, 'startedAt', 64, false);

    await ensureCollection(APPWRITE_CONFIG.collections.emailProviders, 'Email Providers');
    await ensureStringAttr(APPWRITE_CONFIG.collections.emailProviders, 'type', 64, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.emailProviders, 'providerId', 128, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.emailProviders, 'updatedAt', 64, false);

    await ensureCollection(APPWRITE_CONFIG.collections.activityLogs, 'Activity Logs');
    await ensureStringAttr(APPWRITE_CONFIG.collections.activityLogs, 'userId', 128, false);
    await ensureStringAttr(APPWRITE_CONFIG.collections.activityLogs, 'orgId', 128, false);
    await ensureStringAttr(APPWRITE_CONFIG.collections.activityLogs, 'action', 128, true);
    await ensureStringAttr(APPWRITE_CONFIG.collections.activityLogs, 'ip', 64, false);
    await ensureStringAttr(APPWRITE_CONFIG.collections.activityLogs, 'details', 1024, false);
    await ensureStringAttr(APPWRITE_CONFIG.collections.activityLogs, 'timestamp', 64, true);
  } catch (err: any) {
    backendErrorLogger.log('warning', `Failed while ensuring collections: ${err.message}`, 'dbInit');
  }
}
