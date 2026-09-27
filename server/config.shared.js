
const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API: {
    PRODUCTION_URL: 'https://api.kunalpatil.me',
    DEVELOPMENT_URL: 'http://localhost:5000',
    get BASE_URL() {
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return this.DEVELOPMENT_URL;
        }
        return this.PRODUCTION_URL;
      }
      return this.NODE_ENV === 'production' ? this.PRODUCTION_URL : this.DEVELOPMENT_URL;
    },
    ENDPOINTS: {
      projects: '/api/projects',
      blogs: '/api/blogs',
      documentation: '/api/documentation',
      notes: '/api/notes',
      code: '/api/code',
      todos: '/api/todos',
      diagrams: '/api/diagrams',
      auth: '/api/auth',
      views: '/api/views',
      github: '/api/github',
    }
  },
  FRONTEND: {
    PRODUCTION_URL: 'https://www.kunalpatil.me',
    DEVELOPMENT_URL: 'http://localhost:3002',
    get BASE_URL() {
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }
      return this.NODE_ENV === 'production' ? this.PRODUCTION_URL : this.DEVELOPMENT_URL;
    }
  },
  ADMIN: {
    PRODUCTION_URL: 'https://admin.kunalpatil.me',
    DEVELOPMENT_URL: 'http://localhost:3001',
    get BASE_URL() {
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }
      return this.NODE_ENV === 'production' ? this.PRODUCTION_URL : this.DEVELOPMENT_URL;
    }
  },
  CORS: {
    ORIGINS: [
      'https://kunalpatil.me',
      'https://www.kunalpatil.me',
      'https://kunalpatil.in',
      'https://www.kunalpatil.in',
      'http://localhost:5173',
      'https://apiv1.kunalpatil.me',
      'https://api.kunalpatil.me',
      'https://portfolio.kunalpatil.me',
      'https://admin.kunalpatil.me',
      'https://www.admin.kunalpatil.me',
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:8080',
    ]
  },
  AZURE: {
    CONTAINERS: {
      NOTES: 'notes',
      CODE: 'code',
      DIAGRAMS: 'diagrams',
    }
  },
  DATABASE: {
    NAME: 'Portfolio'
  },
  SERVER: {
    PORT: process.env.PORT || 5000,
  }
};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
if (typeof window !== 'undefined') {
  window.APP_CONFIG = CONFIG;
}
export default CONFIG;
