const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/shadowbarter';

async function clearDB() {
  await mongoose.connect(MONGO_URI);
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
    console.log(`Cleared collection: ${collectionName}`);
  }
  console.log('Database Wipe Complete.');
  process.exit();
}

clearDB();
