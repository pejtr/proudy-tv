import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users, streams } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('Creating Justine streamer account and live stream...');

// Create or update Justine user
const justineOpenId = 'justine-demo-streamer';
const existingUsers = await db.select().from(users).where(eq(users.openId, justineOpenId));

let justineUser;
if (existingUsers.length > 0) {
  justineUser = existingUsers[0];
  console.log('✓ Justine user already exists:', justineUser.id);
} else {
  const [newUser] = await db.insert(users).values({
    openId: justineOpenId,
    name: 'Justine',
    email: 'justine@proudy.tv',
    role: 'streamer',
    loginMethod: 'demo',
  });
  justineUser = { id: newUser.insertId };
  console.log('✓ Created Justine user:', justineUser.id);
}

// Create live stream with video
const streamKey = 'justine-' + Math.random().toString(36).substring(7);
const [newStream] = await db.insert(streams).values({
  streamerId: justineUser.id,
  title: 'Justine Live Stream 🎮',
  description: 'Non-stop gaming stream! Join the fun!',
  streamKey: streamKey,
  isLive: true,
  startedAt: new Date(),
  hlsUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/xtPOmZSEpelIfxrc.mp4',
  thumbnailUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/xtPOmZSEpelIfxrc.mp4',
  viewerCount: 42,
  peakViewerCount: 89,
});

console.log('✓ Created live stream:', newStream.insertId);
console.log('✓ Stream URL: /stream/' + newStream.insertId);
console.log('\n🎉 Justine is now LIVE on PROUDY.TV!');

await connection.end();
