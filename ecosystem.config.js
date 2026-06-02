const path = require("path");

module.exports = {
  apps: [
    {
      name: "brunogusmao-api",
      cwd: path.join(__dirname, "apps/api"),
      script: "node",
      args: "dist/main.js",
      env: { NODE_ENV: "production" },
      restart_delay: 3000,
      max_memory_restart: "400M",
    },
    {
      name: "brunogusmao-web",
      cwd: path.join(__dirname, "apps/web"),
      script: "node_modules/.bin/next",
      args: "start",
      env: { NODE_ENV: "production", PORT: "3000" },
      restart_delay: 3000,
      max_memory_restart: "400M",
    },
  ],
};
