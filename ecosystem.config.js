module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'location-timezone',
      script: 'index.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '250M',

      // Logging configuration
      log_file: './logs/pm2-combined.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Log rotation
      max_restarts: 3,
      min_uptime: '10s',

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 7755,
        LOG_LEVEL: 'info',
        LOG_DIR: './logs'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 7755,
        LOG_LEVEL: 'warn',
        LOG_DIR: './logs'
      }
    },
  ],
};
