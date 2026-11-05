import { Router, Request, Response } from 'express';
import { ID, Query } from 'node-appwrite';
import { databasesService, APPWRITE_CONFIG } from '../services/appwrite.js';
import { backendErrorLogger } from '../utils/errorLogger.js';

export const channelsRouter = Router();

// 1. List connected channels for an organization
channelsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }

    const dbId = APPWRITE_CONFIG.databaseId;
    const collId = APPWRITE_CONFIG.collections.connectedChannels;

    const list = await databasesService.listDocuments(dbId, collId, [
      Query.equal('orgId', orgId)
    ]);

    const channels = list.documents.map(doc => ({
      id: doc.$id,
      orgId: doc.orgId,
      platform: doc.platform,
      externalId: doc.externalId,
      name: doc.name,
      logoUrl: doc.logoUrl,
      permissions: doc.permissions || [],
      connectedAt: doc.connectedAt,
      status: doc.status || 'active'
    }));

    return res.json({
      total: list.total,
      quota: 5, // Default quota per organization
      channels
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `List channels error: ${err.message}`, 'channelsRouter/list');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 2. Facebook Connection Initiation (Generates OAuth URL with live stream scopes)
channelsRouter.get('/facebook/oauth-url', (req: Request, res: Response) => {
  const orgId = (req.query.orgId as string) || 'default_org';
  const clientId = process.env.FACEBOOK_CLIENT_ID || process.env.client_id;
  const redirectUri = process.env.FACEBOOK_CALLBACK_URL || process.env.callback_url;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Facebook OAuth is not configured on server' });
  }

  // Requested live streaming permissions per PRD 4.3
  const scopes = [
    'email',
    'public_profile',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'publish_video'
  ].join(',');

  const state = Buffer.from(JSON.stringify({ orgId, platform: 'facebook', timestamp: Date.now() })).toString('base64');
  const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}&response_type=code`;

  return res.json({ url: oauthUrl });
});

// 3. Google / YouTube Connection Initiation (Generates OAuth URL with live stream scopes)
channelsRouter.get('/youtube/oauth-url', (req: Request, res: Response) => {
  const orgId = (req.query.orgId as string) || 'default_org';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Google OAuth is not configured on server' });
  }

  // Requested YouTube Live scopes per PRD 4.3
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ].join(' ');

  const state = Buffer.from(JSON.stringify({ orgId, platform: 'youtube', timestamp: Date.now() })).toString('base64');
  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;

  return res.json({ url: oauthUrl });
});

// 4. Save Connected Channel (Enforces quota limit and stores circular logo)
channelsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { orgId, platform, externalId, name, logoUrl, permissions, accessToken } = req.body;

    if (!orgId || !platform || !externalId || !name) {
      return res.status(400).json({ error: 'Missing required channel parameters (orgId, platform, externalId, name)' });
    }

    const dbId = APPWRITE_CONFIG.databaseId;
    const collId = APPWRITE_CONFIG.collections.connectedChannels;

    // Check organization quota limit
    const existing = await databasesService.listDocuments(dbId, collId, [
      Query.equal('orgId', orgId)
    ]);

    const quotaLimit = 5;
    if (existing.total >= quotaLimit) {
      return res.status(403).json({
        error: `Organization connection quota reached (${existing.total}/${quotaLimit}). Please ask a Super Admin to increase your limit.`
      });
    }

    // Check for duplicate channel
    const duplicate = existing.documents.find(
      doc => doc.platform === platform && doc.externalId === externalId
    );
    if (duplicate) {
      return res.status(409).json({ error: 'This channel or page is already connected to this organization.' });
    }

    const now = new Date().toISOString();
    const doc = await databasesService.createDocument(dbId, collId, ID.unique(), {
      orgId,
      platform,
      externalId,
      name,
      logoUrl: logoUrl || (platform === 'facebook'
        ? 'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg'
        : 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg'),
      accessToken: accessToken || 'simulated_oauth_token',
      permissions: permissions || ['live_broadcast'],
      connectedAt: now,
      status: 'active'
    });

    return res.status(201).json({
      id: doc.$id,
      orgId: doc.orgId,
      platform: doc.platform,
      externalId: doc.externalId,
      name: doc.name,
      logoUrl: doc.logoUrl,
      permissions: doc.permissions,
      connectedAt: doc.connectedAt,
      status: doc.status
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `Create channel error: ${err.message}`, 'channelsRouter/create');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 5. Disconnect / Remove channel
channelsRouter.delete('/:channelId', async (req: Request, res: Response) => {
  try {
    const channelId = req.params.channelId as string;
    const dbId = APPWRITE_CONFIG.databaseId;
    const collId = APPWRITE_CONFIG.collections.connectedChannels;

    await databasesService.deleteDocument(dbId, collId, channelId);
    return res.json({ success: true, message: 'Channel disconnected successfully' });
  } catch (err: any) {
    backendErrorLogger.log('error', `Delete channel error: ${err.message}`, 'channelsRouter/delete');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

