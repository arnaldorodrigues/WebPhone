module.exports = {
  apps: [
    {
      name: 'WebPhone',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/WebPhone',
      instances: 1, // Start with 1 instance for debugging
      exec_mode: 'fork', // Use fork mode for debugging
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
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
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      
      // Increase timeouts
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Environment variables
      merge_logs: true,
      combine_logs: true,
    }
  ]
}; 