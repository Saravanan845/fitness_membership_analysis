const mongoose = require('mongoose');

beforeAll(async () => {
  const testURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fittrack_test';
  try {
    await mongoose.connect(testURI, {
      serverSelectionTimeoutMS: 5000
    });
  } catch (err) {
    console.warn('[Test DB Warning] Could not connect to local Mongo daemon, mocking queries if needed.');
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch (err) {
    // Ignore cleanup error
  }
});
