const mongoose = require('mongoose');
const dataStore = require('./dataStore');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('ℹ️  No MONGODB_URI provided in .env. Running in Standalone Resilient DataStore mode.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB connection lost');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully');
    });
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed, falling back to Local Standalone DataStore:', err.message);
  }
};

module.exports = { connectDB, dataStore };
