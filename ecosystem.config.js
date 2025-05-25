module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: "location-timezone",
      script: "index.js",
      max_memory_restart: "250M",
      env: {
        PORT: 7755,
      },
    },
  ],
};
