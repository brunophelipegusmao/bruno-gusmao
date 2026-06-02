module.exports = {
  apps: [
    {
      name: "brunogusmao-api",
      cwd: "/home/bruno/bruno-gusmao/apps/api",
      script: "node",
      args: "dist/main.js",
      env: { NODE_ENV: "production" },
      restart_delay: 3000,
      max_memory_restart: "400M",
    },
    {
      name: "brunogusmao-web",
      cwd: "/home/bruno/bruno-gusmao/apps/web",
      script: "node_modules/.bin/next",
      args: "start",
      env: { NODE_ENV: "production", PORT: "3000" },
      restart_delay: 3000,
      max_memory_restart: "400M",
    },
  ],
};
