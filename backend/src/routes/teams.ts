import { Router, Request, Response } from 'express';
import { ID } from 'node-appwrite';
import { teamsService, usersService } from '../services/appwrite.js';
import { backendErrorLogger } from '../utils/errorLogger.js';

export const teamsRouter = Router();

// 1. List all teams/organizations (or user's organizations)
teamsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const list = await teamsService.list();
    return res.json({
      total: list.total,
      teams: list.teams.map(t => ({
        id: t.$id,
        name: t.name,
        total: t.total,
        createdAt: t.$createdAt,
        updatedAt: t.$updatedAt
      }))
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `List teams error: ${err.message}`, 'teamsRouter/list');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 2. Create a new organization/team workspace
teamsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, ownerUserId } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const team = await teamsService.create(ID.unique(), name.trim(), ['owner', 'admin']);

    // If an owner was specified, add membership for that owner
    if (ownerUserId) {
      try {
        const owner = await usersService.get(ownerUserId);
        await teamsService.createMembership(
          team.$id,
          ['owner', 'admin'],
          owner.email,
          owner.$id,
          undefined,
          'http://localhost:3000/teams',
          owner.name || undefined
        );
      } catch (memberErr: any) {
        backendErrorLogger.log('warning', `Failed to auto-add owner membership: ${memberErr.message}`, 'teamsRouter/create');
      }
    }

    return res.status(201).json({
      id: team.$id,
      name: team.name,
      total: team.total,
      createdAt: team.$createdAt
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `Create team error: ${err.message}`, 'teamsRouter/create');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 3. List memberships for an organization
teamsRouter.get('/:teamId/members', async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId as string;
    const list = await teamsService.listMemberships(teamId);
    return res.json({
      total: list.total,
      members: list.memberships.map(m => ({
        id: m.$id,
        userId: m.userId,
        userName: m.userName,
        userEmail: m.userEmail,
        roles: m.roles,
        invited: m.invited,
        joined: m.joined,
        confirm: m.confirm
      }))
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `List members error: ${err.message}`, 'teamsRouter/members');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 4. Invite/Add admin or member to organization workspace
teamsRouter.post('/:teamId/members', async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId as string;
    const { email, role, name, userId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required to invite a member' });
    }

    const assignedRoles = role === 'admin' ? ['admin'] : ['member'];
    const membership = await teamsService.createMembership(
      teamId,
      assignedRoles,
      email,
      userId || undefined,
      undefined,
      'http://localhost:3000/teams',
      name || undefined
    );

    return res.status(201).json({
      id: membership.$id,
      userId: membership.userId,
      userName: membership.userName,
      userEmail: membership.userEmail,
      roles: membership.roles,
      invited: membership.invited,
      confirm: membership.confirm
    });
  } catch (err: any) {
    backendErrorLogger.log('error', `Invite member error: ${err.message}`, 'teamsRouter/invite');
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// 5. Remove member from organization
teamsRouter.delete('/:teamId/members/:membershipId', async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId as string;
    const membershipId = req.params.membershipId as string;
    await teamsService.deleteMembership(teamId, membershipId);
    return res.json({ success: true, message: 'Membership removed' });
  } catch (err: any) {
    backendErrorLogger.log('error', `Delete member error: ${err.message}`, 'teamsRouter/deleteMember');
    return res.status(err.code || 500).json({ error: err.message });
  }
});
