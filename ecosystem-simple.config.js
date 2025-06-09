module.exports = {
  apps: [
    {
      name: 'WebPhone',
      script: './start.sh',
      cwd: '/var/www/WebPhone',
      instances: 1,
      exec_mode: 'fork',
      interpreter: 'bash',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logging
      log_file: '/var/log/pm2/WebPhone.log',
      out_file: '/var/log/pm2/WebPhone-out.log',
      error_file: '/var/log/pm2/WebPhone-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart settings
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
    }
  ]
}; 