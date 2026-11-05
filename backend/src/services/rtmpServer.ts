// @ts-ignore
import NodeMediaServer from 'node-media-server';
import { databasesService, APPWRITE_CONFIG } from './appwrite.js';
import { Query } from 'node-appwrite';
import { backendErrorLogger } from '../utils/errorLogger.js';

let nmsInstance: any = null;

export function initRtmpServer() {
  const rtmpPort = parseInt(process.env.RTMP_PORT || '1935', 10);
  const httpPort = parseInt(process.env.HTTP_STREAM_PORT || '8000', 10);

  const config = {
    rtmp: {
      port: rtmpPort,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60
    },
    http: {
      port: httpPort,
      allow_origin: '*',
      mediaroot: './media'
    },
    logType: 1
  };

  const nms = new NodeMediaServer(config);
  nmsInstance = nms;

  nms.on('prePublish', async (id: string, StreamPath?: string) => {
    console.log(`[RTMP] Stream publish request: id=${id} path=${StreamPath}`);
    if (!StreamPath || typeof StreamPath !== 'string') return;
    const streamKey = StreamPath.replace(/^\/live\//, '');
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const collId = APPWRITE_CONFIG.collections.streamSessions;
      const list = await databasesService.listDocuments(dbId, collId, [
        Query.equal('streamKey', streamKey)
      ]);
      if (list.total > 0) {
        console.log(`[RTMP] Authorized publisher for organization: ${list.documents[0].orgId}`);
      } else {
        console.log(`[RTMP] Stream key ${streamKey} published (allowing stream)`);
      }
    } catch (e: any) {
      console.warn(`[RTMP] Stream authorization check skipped: ${e.message}`);
    }
  });

  nms.on('postPublish', async (id: string, StreamPath?: string) => {
    console.log(`[RTMP] Live broadcast ON AIR: id=${id} path=${StreamPath}`);
    if (!StreamPath || typeof StreamPath !== 'string') return;
    const streamKey = StreamPath.replace(/^\/live\//, '');
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const collId = APPWRITE_CONFIG.collections.streamSessions;
      const list = await databasesService.listDocuments(dbId, collId, [
        Query.equal('streamKey', streamKey)
      ]);
      if (list.total > 0) {
        await databasesService.updateDocument(dbId, collId, list.documents[0].$id, {
          status: 'live',
          startedAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      backendErrorLogger.log('warning', `Failed to mark stream live in DB: ${err.message}`, 'rtmpServer');
    }
  });

  nms.on('donePublish', async (id: string, StreamPath?: string) => {
    console.log(`[RTMP] Live broadcast ended: id=${id} path=${StreamPath}`);
    if (!StreamPath || typeof StreamPath !== 'string') return;
    const streamKey = StreamPath.replace(/^\/live\//, '');
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const collId = APPWRITE_CONFIG.collections.streamSessions;
      const list = await databasesService.listDocuments(dbId, collId, [
        Query.equal('streamKey', streamKey)
      ]);
      if (list.total > 0) {
        await databasesService.updateDocument(dbId, collId, list.documents[0].$id, {
          status: 'idle'
        });
      }
    } catch (err: any) {
      backendErrorLogger.log('warning', `Failed to mark stream idle in DB: ${err.message}`, 'rtmpServer');
    }
  });

  try {
    nms.run();
    console.log(`[RTMP] NodeMediaServer successfully started on RTMP port ${rtmpPort} and HTTP port ${httpPort}`);
  } catch (err: any) {
    console.error(`[RTMP] Failed to start RTMP server: ${err.message}`);
    backendErrorLogger.log('error', `RTMP server start error: ${err.message}`, 'rtmpServer');
  }

  return nms;
}

export function getRtmpServer() {
  return nmsInstance;
}
