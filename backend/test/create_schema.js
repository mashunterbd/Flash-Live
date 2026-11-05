import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function run() {
  const dbId = 'flashlive_main';
  const collId = 'connected_channels';
  
  try {
    const coll = await databases.createCollection(
      dbId,
      collId,
      'Connected Channels',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );
    console.log('Collection created:', coll.$id);
  } catch (e) {
    console.log('Coll status:', e.code, e.message);
  }

  // Create attributes helper
  async function addAttr(fn, ...args) {
    try {
      await fn(...args);
      console.log('Attr created:', args[2]);
    } catch (e) {
      console.log('Attr', args[2], 'code:', e.code, e.message);
    }
  }

  await addAttr(databases.createStringAttribute.bind(databases), dbId, collId, 'orgId', 128, true);
  await addAttr(databases.createStringAttribute.bind(databases), dbId, collId, 'platform', 64, true);
  await addAttr(databases.createStringAttribute.bind(databases), dbId, collId, 'externalId', 255, true);
  await addAttr(databases.createStringAttribute.bind(databases), dbId, collId, 'name', 255, true);
  await addAttr(databases.createStringAttribute.bind(databases), dbId, collId, 'logoUrl', 1024, false);
  await addAttr(databases.createStringAttribute.bind(databases), dbId, collId, 'accessToken', 2048, false);
  await addAttr(databases.createStringAttribute.bind(databases), dbId, collId, 'permissions', 128, false, undefined, true);
  await addAttr(databases.createStringAttribute.bind(databases), dbId, collId, 'connectedAt', 64, true);
  await addAttr(databases.createStringAttribute.bind(databases), dbId, collId, 'status', 64, false);
}

run();

