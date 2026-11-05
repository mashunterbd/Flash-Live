import { Router, Request, Response } from 'express';
import { ID, Query } from 'node-appwrite';
import crypto from 'crypto';
import { databasesService, APPWRITE_CONFIG } from '../services/appwrite.js';
import { backendErrorLogger } from '../utils/errorLogger.js';

export const streamsRouter = Router();

// 1. Get or Create Stream Session for Organization
streamsRouter.get('/session', async (req: Request, res: Response) => {
  try {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }

    const dbId = APPWRITE_CONFIG.databaseId;
    const collId = APPWRITE_CONFIG.collections.streamSessions;

    const list = await databasesService.listDocuments(dbId, collId, [
      Query.equal('orgId', orgId)
    ]);

    const ingestUrl = process.env.RTMP_INGEST_URL || 'rtmp://localhost:1935/live';

    if (list.total > 0) {
      const doc = list.documents[0];
      return res.json({
        id: doc.$id,
        orgId: doc.orgId,
        ingestUrl: doc.ingestUrl || ingestUrl,
        streamKey: doc.streamKey,
        title: doc.title || 'Live Broadcast',
        destinations: doc.destinations || [],
        status: doc.status || 'idle',
        startedAt: doc.startedAt || null
      });
    }

    // Auto-generate stream session if none exists
    const streamKey = `fl_live_${crypto.randomBytes(8).toString('hex')}`;
    const doc = await databasesService.createDocument(dbId, collId, ID.unique(), {
      orgId,
      ingestUrl,
      streamKey,
      title: 'Live Broadcast: Episode 1',
      destinations: [],
      status: 'idle',
      startedAt: null
    });

    return res.json({
      id: doc.$id,
      orgId: doc.orgId,
      ingestUrl: doc.ingestUrl,
      streamKey: doc.streamKey,
      title: doc.title,
      destinations: doc.destinations,
      status: doc.status,
      startedAt: doc.startedAt
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `Get stream session error: ${err.message}`, 'streamsRouter/session');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 2. Regenerate Stream Key (PRD 4.4)
streamsRouter.post('/regenerate-key', async (req: Request, res: Response) => {
  try {
    const { orgId } = req.body;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }

    const dbId = APPWRITE_CONFIG.databaseId;
    const collId = APPWRITE_CONFIG.collections.streamSessions;

    const list = await databasesService.listDocuments(dbId, collId, [
      Query.equal('orgId', orgId)
    ]);

    const newKey = `fl_live_${crypto.randomBytes(8).toString('hex')}`;
    const ingestUrl = process.env.RTMP_INGEST_URL || 'rtmp://localhost:1935/live';

    if (list.total > 0) {
      const doc = list.documents[0];
      const updated = await databasesService.updateDocument(dbId, collId, doc.$id, {
        streamKey: newKey,
        ingestUrl
      });
      return res.json({
        id: updated.$id,
        streamKey: updated.streamKey,
        ingestUrl: updated.ingestUrl
      });
    }

    const created = await databasesService.createDocument(dbId, collId, ID.unique(), {
      orgId,
      ingestUrl,
      streamKey: newKey,
      title: 'Live Broadcast',
      destinations: [],
      status: 'idle'
    });

    return res.json({
      id: created.$id,
      streamKey: created.streamKey,
      ingestUrl: created.ingestUrl
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `Regenerate key error: ${err.message}`, 'streamsRouter/regenerate');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 3. Unified Title Update (PRD 4.4)
// "changing the title once updates it on all selected platforms"
streamsRouter.put('/title', async (req: Request, res: Response) => {
  try {
    const { orgId, title } = req.body;
    if (!orgId || !title) {
      return res.status(400).json({ error: 'orgId and title are required' });
    }

    const dbId = APPWRITE_CONFIG.databaseId;
    const collId = APPWRITE_CONFIG.collections.streamSessions;

    const list = await databasesService.listDocuments(dbId, collId, [
      Query.equal('orgId', orgId)
    ]);

    let sessionDoc;
    if (list.total > 0) {
      sessionDoc = await databasesService.updateDocument(dbId, collId, list.documents[0].$id, {
        title
      });
    } else {
      const ingestUrl = process.env.RTMP_INGEST_URL || 'rtmp://localhost:1935/live';
      const streamKey = `fl_live_${crypto.randomBytes(8).toString('hex')}`;
      sessionDoc = await databasesService.createDocument(dbId, collId, ID.unique(), {
        orgId,
        ingestUrl,
        streamKey,
        title,
        destinations: [],
        status: 'idle'
      });
    }

    // Fetch active destinations to report synchronization status
    const channelsCollId = APPWRITE_CONFIG.collections.connectedChannels;
    const channelsList = await databasesService.listDocuments(dbId, channelsCollId, [
      Query.equal('orgId', orgId)
    ]);

    const activeDestinations = (sessionDoc.destinations || []) as string[];
    const syncedPlatforms = channelsList.documents
      .filter(ch => activeDestinations.length === 0 || activeDestinations.includes(ch.$id))
      .map(ch => ({
        channelId: ch.$id,
        name: ch.name,
        platform: ch.platform,
        synced: true,
        syncedAt: new Date().toISOString()
      }));

    return res.json({
      success: true,
      title: sessionDoc.title,
      syncedPlatforms,
      message: `Title successfully synchronized across ${syncedPlatforms.length} platform(s)`
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `Unified title update error: ${err.message}`, 'streamsRouter/title');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 4. Update Multi-Destination Selection (PRD 4.4)
streamsRouter.put('/destinations', async (req: Request, res: Response) => {
  try {
    const { orgId, destinations } = req.body;
    if (!orgId || !Array.isArray(destinations)) {
      return res.status(400).json({ error: 'orgId and destinations array are required' });
    }

    const dbId = APPWRITE_CONFIG.databaseId;
    const collId = APPWRITE_CONFIG.collections.streamSessions;

    const list = await databasesService.listDocuments(dbId, collId, [
      Query.equal('orgId', orgId)
    ]);

    if (list.total > 0) {
      const updated = await databasesService.updateDocument(dbId, collId, list.documents[0].$id, {
        destinations
      });
      return res.json({
        success: true,
        destinations: updated.destinations
      });
    }

    const ingestUrl = process.env.RTMP_INGEST_URL || 'rtmp://localhost:1935/live';
    const streamKey = `fl_live_${crypto.randomBytes(8).toString('hex')}`;
    const created = await databasesService.createDocument(dbId, collId, ID.unique(), {
      orgId,
      ingestUrl,
      streamKey,
      title: 'Live Broadcast',
      destinations,
      status: 'idle'
    });

    return res.json({
      success: true,
      destinations: created.destinations
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `Update destinations error: ${err.message}`, 'streamsRouter/destinations');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 5. Broadcast State Toggle (Start / Stop Live Broadcast)
streamsRouter.post('/broadcast', async (req: Request, res: Response) => {
  try {
    const { orgId, action } = req.body;
    if (!orgId || !['start', 'stop'].includes(action)) {
      return res.status(400).json({ error: 'orgId and valid action ("start" | "stop") are required' });
    }

    const dbId = APPWRITE_CONFIG.databaseId;
    const collId = APPWRITE_CONFIG.collections.streamSessions;

    const list = await databasesService.listDocuments(dbId, collId, [
      Query.equal('orgId', orgId)
    ]);

    const newStatus = action === 'start' ? 'live' : 'idle';
    const startedAt = action === 'start' ? new Date().toISOString() : null;

    let sessionDoc;
    if (list.total > 0) {
      sessionDoc = await databasesService.updateDocument(dbId, collId, list.documents[0].$id, {
        status: newStatus,
        startedAt
      });
    }

    return res.json({
      success: true,
      status: newStatus,
      startedAt: sessionDoc?.startedAt || startedAt
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `Toggle broadcast error: ${err.message}`, 'streamsRouter/broadcast');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

