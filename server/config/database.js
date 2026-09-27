import mongoose from 'mongoose';
import CONFIG from '../config.shared.js';
class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnecting = false;
    this.connectionAttempts = 0;
    this.connectionReuses = 0;
  }
  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
  async connect() {
    if (this.connection && mongoose.connection.readyState === 1) {
      this.connectionReuses++;
      console.log(`MongoDB: Using existing connection (reused ${this.connectionReuses} times)`);
      return this.connection;
    }
    if (this.isConnecting) {
      console.log('MongoDB: Connection attempt already in progress, waiting...');
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.connection;
    }
    try {
      this.isConnecting = true;
      this.connectionAttempts++;
      console.log(`MongoDB: Establishing new connection (attempt #${this.connectionAttempts})...`);
      const options = {
        dbName: CONFIG.DATABASE.NAME,
        maxPoolSize: 10, 
        serverSelectionTimeoutMS: 5000, 
        socketTimeoutMS: 45000, 
        bufferCommands: false, 
      };
      await mongoose.connect(process.env.MONGODB_URI, options);
      this.connection = mongoose.connection;
      this.setupEventListeners();
      console.log(`MongoDB: Successfully connected to ${CONFIG.DATABASE.NAME} database`);
      return this.connection;
    } catch (error) {
      console.error('MongoDB: Connection failed:', error.message);
      this.connection = null;
      if (process.env.VERCEL !== '1') {
        throw error;
      }
      return null;
    } finally {
      this.isConnecting = false;
    }
  }
  setupEventListeners() {
    if (!this.connection) return;
    this.connection.on('connected', () => {
      console.log('MongoDB: Connection established');
    });
    this.connection.on('error', (error) => {
      console.error('MongoDB: Connection error:', error);
    });
    this.connection.on('disconnected', () => {
      console.log('MongoDB: Connection disconnected');
      this.connection = null;
    });
    this.connection.on('reconnected', () => {
      console.log('MongoDB: Connection reconnected');
    });
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }
  async disconnect() {
    if (this.connection && mongoose.connection.readyState === 1) {
      try {
        await mongoose.disconnect();
        console.log('MongoDB: Connection closed');
        this.connection = null;
      } catch (error) {
        console.error('MongoDB: Error during disconnection:', error);
      }
    }
  }
  getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
  getConnectionStats() {
    return {
      connectionAttempts: this.connectionAttempts,
      connectionReuses: this.connectionReuses,
      currentStatus: this.getConnectionStatus(),
      isConnected: this.isConnected()
    };
  }
}
const dbConnection = DatabaseConnection.getInstance();
export default dbConnection;