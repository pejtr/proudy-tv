import * as db from './server/db.ts';

async function testOGImage() {
  console.log('Checking for live streams...');
  const streams = await db.getLiveStreams();
  console.log(`Found ${streams.length} live streams`);
  
  if (streams.length > 0) {
    streams.forEach(s => {
      console.log(`  - ID: ${s.id}, Title: ${s.title}, Category: ${s.category || 'N/A'}`);
      console.log(`    OG Image URL: ${process.env.VITE_APP_ID ? 'https://proudy.tv' : 'http://localhost:3000'}/api/og-image/${s.id}`);
    });
  } else {
    console.log('No live streams found. You can test OG image generation by:');
    console.log('1. Creating a stream in the Dashboard');
    console.log('2. Or accessing: http://localhost:3000/api/og-image/1 (will return 404 if stream doesn\'t exist)');
  }
}

testOGImage().catch(console.error);
