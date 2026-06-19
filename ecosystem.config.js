module.exports = {
  apps: [{
    name: "aka-gaming",
    script: "npm",
    args: "start",
    cwd: "/opt/aka-gaming",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    watch: false,
    max_memory_restart: "500M",
    env: {
      NODE_ENV: "production",
      PORT: "3000"
    },
    error_file: "/root/.pm2/logs/aka-gaming-error.log",
    out_file: "/root/.pm2/logs/aka-gaming-out.log",
    merge_logs: true,
    kill_timeout: 5000,
    listen_timeout: 10000,
    restart_delay: 3000
  }]
};
