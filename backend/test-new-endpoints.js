/**
 * Script para probar los nuevos endpoints del bot
 */

const BASE_URL = 'http://localhost:3001';
const TEST_MEETING_ID = 'test-meeting-12345';

async function testEndpoints() {
  console.log('🧪 Testing new bot endpoints...\n');

  try {
    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);

    // 2. Test start bot
    console.log('\n2. Testing start bot...');
    const startResponse = await fetch(`${BASE_URL}/api/meetings/${TEST_MEETING_ID}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingUrl: 'https://meet.google.com/abc-defg-hij' })
    });
    const startData = await startResponse.json();
    console.log('✅ Start bot:', startData);

    // 3. Test bot status
    console.log('\n3. Testing bot status...');
    const statusResponse = await fetch(`${BASE_URL}/api/meetings/${TEST_MEETING_ID}/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Bot status:', statusData);

    // 4. Test start recording
    console.log('\n4. Testing start recording...');
    const recordStartResponse = await fetch(`${BASE_URL}/api/meetings/${TEST_MEETING_ID}/recording/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const recordStartData = await recordStartResponse.json();
    console.log('✅ Start recording:', recordStartData);

    // 5. Test status again (should show recording)
    console.log('\n5. Testing status with recording...');
    const statusResponse2 = await fetch(`${BASE_URL}/api/meetings/${TEST_MEETING_ID}/status`);
    const statusData2 = await statusResponse2.json();
    console.log('✅ Bot status (recording):', statusData2);

    // 6. Test stop recording
    console.log('\n6. Testing stop recording...');
    const recordStopResponse = await fetch(`${BASE_URL}/api/meetings/${TEST_MEETING_ID}/recording/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const recordStopData = await recordStopResponse.json();
    console.log('✅ Stop recording:', recordStopData);

    // 7. Test stop bot
    console.log('\n7. Testing stop bot...');
    const stopResponse = await fetch(`${BASE_URL}/api/meetings/${TEST_MEETING_ID}/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const stopData = await stopResponse.json();
    console.log('✅ Stop bot:', stopData);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
if (require.main === module) {
  testEndpoints();
}

module.exports = { testEndpoints };
