import dbConnection from '../config/database.js';
class DatabaseUtils {
  constructor() {
    this.dbConnection = dbConnection;
  }
  static getInstance() {
    if (!DatabaseUtils.instance) {
      DatabaseUtils.instance = new DatabaseUtils();
    }
    return DatabaseUtils.instance;
  }
  async ensureConnection() {
    if (!this.dbConnection.isConnected()) {
      console.log('Database: Reconnecting...');
      await this.dbConnection.connect();
    }
    return this.dbConnection.connection;
  }
  async executeOperation(operation, operationName = 'Database Operation') {
    try {
      await this.ensureConnection();
      console.log(`Database: Executing ${operationName}`);
      const result = await operation();
      return result;
    } catch (error) {
      console.error(`Database: ${operationName} failed:`, error.message);
      throw error;
    }
  }
  getConnectionInfo() {
    return {
      status: this.dbConnection.getConnectionStatus(),
      isConnected: this.dbConnection.isConnected(),
      readyState: this.dbConnection.connection?.readyState || 0
    };
  }
  async healthCheck() {
    try {
      await this.ensureConnection();
      const admin = this.dbConnection.connection.db.admin();
      const result = await admin.ping();
      return {
        status: 'healthy',
        connected: true,
        ping: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
const databaseUtils = DatabaseUtils.getInstance();
export default databaseUtils;