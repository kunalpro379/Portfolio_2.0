import express from 'express';
import cors from 'cors';
import CONFIG from '../config.shared.js';
class ServerConfig {
  constructor() {
    this.app = null;
    this.server = null;
    this.isConfigured = false;
  }
  static getInstance() {
    if (!ServerConfig.instance) {
      ServerConfig.instance = new ServerConfig();
    }
    return ServerConfig.instance;
  }
  getApp() {
    if (!this.app || !this.isConfigured) {
      this.app = this.createApp();
      this.configureMiddleware();
      this.isConfigured = true;
      console.log('Server: Express application configured');
    }
    return this.app;
  }
  createApp() {
    const app = express();
    app.set('trust proxy', 1);
    return app;
  }
  configureMiddleware() {
    if (!this.app) return;
    this.configureCORS();
    this.configureCacheControl();
    this.configureRequestLogging();
    this.configureBodyParsing();
    this.configureErrorHandling();
  }
  configureCORS() {
    console.log('Server: Configuring CORS with origins:', CONFIG.CORS.ORIGINS);
    this.app.options('*', (req, res) => {
      const origin = req.headers.origin;
      const allowedOrigin = CONFIG.CORS.ORIGINS.includes(origin) ? origin : null;
      if (allowedOrigin) {
        res.header('Access-Control-Allow-Origin', allowedOrigin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length, X-File-Name, X-File-Size, X-File-Type');
        res.header('Access-Control-Max-Age', '86400');
        res.status(204).end();
      } else {
        res.status(403).end();
      }
    });
    const corsOptions = {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (CONFIG.CORS.ORIGINS.includes(origin)) {
          console.log('CORS: Allowing origin:', origin);
          callback(null, true);
        } else {
          console.log('CORS: Blocked origin:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 
        'Authorization', 'Content-Length', 'X-File-Name', 
        'X-File-Size', 'X-File-Type'
      ],
      exposedHeaders: ['Content-Length', 'Content-Type'],
      maxAge: 86400,
      preflightContinue: false,
      optionsSuccessStatus: 204
    };
    this.app.use(cors(corsOptions));
  }
  configureCacheControl() {
    this.app.use((req, res, next) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      next();
    });
  }
  configureRequestLogging() {
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      const logData = {
        method: req.method,
        path: req.path,
        origin: req.headers.origin,
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length'],
        userAgent: req.headers['user-agent']?.substring(0, 50)
      };
      console.log(`[${timestamp}] ${req.method} ${req.path}`, logData);
      next();
    });
  }
  configureBodyParsing() {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
  }
  configureErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error('Server Error:', err);
      const origin = req.headers.origin;
      const allowedOrigin = CONFIG.CORS.ORIGINS.includes(origin) ? origin : null;
      if (allowedOrigin) {
        res.header('Access-Control-Allow-Origin', allowedOrigin);
        res.header('Access-Control-Allow-Credentials', 'true');
      }
      const statusCode = err.status || err.statusCode || 500;
      const message = err.message || 'Internal server error';
      res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });
  }
  async startServer(port = CONFIG.SERVER.PORT) {
    return new Promise((resolve, reject) => {
      try {
        if (process.env.VERCEL === '1') {
          console.log('Server: Running in serverless mode, skipping port binding');
          resolve(null);
          return;
        }
        if (this.server) {
          console.log('Server: Already running');
          resolve(this.server);
          return;
        }
        this.server = this.app.listen(port, () => {
          console.log(`Server: Running on port ${port}`);
          console.log(`Server: Environment - ${process.env.NODE_ENV || 'development'}`);
          resolve(this.server);
        });
        this.server.on('error', (error) => {
          console.error('Server: Failed to start:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Server: Startup error:', error);
        reject(error);
      }
    });
  }
  async stopServer() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Server: Stopped gracefully');
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  getStatus() {
    return {
      configured: this.isConfigured,
      running: !!this.server,
      port: this.server?.address()?.port || null,
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
const serverConfig = ServerConfig.getInstance();
export default serverConfig;