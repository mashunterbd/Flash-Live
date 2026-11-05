import { Router, Request, Response } from 'express';
import { usersService, appwriteServerClient } from '../services/appwrite.js';
import { backendErrorLogger } from '../utils/errorLogger.js';

export const authRouter = Router();

// 0. List all users (Super Admin only)
authRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const requesterId = (req.headers['x-user-id'] as string) || (req.query.requesterId as string);
    if (!requesterId) {
      return res.status(401).json({ error: 'Super Admin authentication required' });
    }

    const requester = await usersService.get(requesterId);
    if (!Array.isArray(requester.labels) || !requester.labels.includes('admin')) {
      return res.status(403).json({ error: 'Super Admin privileges required' });
    }

    const userList = await usersService.list();
    return res.json({
      total: userList.total,
      users: userList.users.map(u => ({
        id: u.$id,
        email: u.email,
        name: u.name,
        labels: u.labels,
        status: u.status,
        emailVerification: u.emailVerification,
        registration: u.registration
      }))
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `List users error: ${err.message}`, 'authRouter/users');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 1. Get current user profile & role logic
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    const user = await usersService.get(userId);
    const isSuperAdmin = Array.isArray(user.labels) && user.labels.includes('admin');

    return res.json({
      id: user.$id,
      email: user.email,
      name: user.name,
      labels: user.labels,
      isSuperAdmin,
      role: isSuperAdmin ? 'SUPER_ADMIN' : 'NORMAL_USER',
      emailVerification: user.emailVerification,
      status: user.status,
      accessedAt: user.accessedAt,
      registration: user.registration
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `Auth /me error: ${err.message}`, 'authRouter/me');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 2. List active sessions for user (shows IP, device, OS, location)
authRouter.get('/sessions', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    const sessionList = await usersService.listSessions(userId);
    const sessions = sessionList.sessions.map(s => ({
      id: s.$id,
      userId: s.userId,
      expire: s.expire,
      ip: s.ip || 'Unknown IP',
      osCode: s.osCode,
      osName: s.osName || 'Unknown OS',
      osVersion: s.osVersion,
      clientType: s.clientType || 'browser',
      clientCode: s.clientCode,
      clientName: s.clientName || 'Web Browser',
      clientVersion: s.clientVersion,
      clientEngine: s.clientEngine,
      deviceModel: s.deviceModel || 'Desktop/Workstation',
      deviceBrand: s.deviceBrand,
      countryCode: s.countryCode,
      countryName: s.countryName || 'Global',
      current: s.current || false
    }));

    return res.json({ total: sessions.length, sessions });
  } catch (err: any) {
    backendErrorLogger.log('error', `List sessions error: ${err.message}`, 'authRouter/sessions');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 3. Revoke a specific session
authRouter.delete('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const sessionId = req.params.sessionId as string;

    if (!userId || !sessionId) {
      return res.status(400).json({ error: 'User ID and Session ID are required' });
    }

    await usersService.deleteSession(userId, sessionId);
    return res.json({ success: true, message: `Session ${sessionId} revoked` });
  } catch (err: any) {
    backendErrorLogger.log('error', `Delete session error: ${err.message}`, 'authRouter/deleteSession');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 4. Role Assignment (Super Admin label 'admin' management)
authRouter.post('/role', async (req: Request, res: Response) => {
  try {
    const requesterId = req.headers['x-user-id'] as string;
    const { targetUserId, grantSuperAdmin } = req.body;

    if (!requesterId || !targetUserId) {
      return res.status(400).json({ error: 'requesterId and targetUserId are required' });
    }

    // Verify requester is Super Admin
    const requester = await usersService.get(requesterId);
    if (!Array.isArray(requester.labels) || !requester.labels.includes('admin')) {
      return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    }

    const target = await usersService.get(targetUserId);
    let newLabels = [...(target.labels || [])];

    if (grantSuperAdmin) {
      if (!newLabels.includes('admin')) newLabels.push('admin');
    } else {
      newLabels = newLabels.filter(l => l !== 'admin');
    }

    const updated = await usersService.updateLabels(targetUserId, newLabels);
    return res.json({
      userId: updated.$id,
      labels: updated.labels,
      isSuperAdmin: updated.labels.includes('admin'),
      role: updated.labels.includes('admin') ? 'SUPER_ADMIN' : 'NORMAL_USER'
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `Role management error: ${err.message}`, 'authRouter/role');
    return res.status(err.code || 500).json({ error: err.message });
  }
});
