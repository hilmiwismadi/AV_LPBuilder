module.exports = {
  apps: [
    {
      name: 'lpbuilder-frontend',
      script: 'npm',
      args: 'run dev:client',
      cwd: '/path/to/AV_LPBuilder/landingPage/app',
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/lpbuilder-frontend-error.log',
      out_file: './logs/lpbuilder-frontend-out.log',
      time: true
    },
    {
      name: 'lpbuilder-backend',
      script: 'server/index.js',
      cwd: '/path/to/AV_LPBuilder/landingPage/app',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        DATABASE_URL: 'postgresql://username:password@localhost:5432/database_name?schema=public'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      error_file: './logs/lpbuilder-backend-error.log',
      out_file: './logs/lpbuilder-backend-out.log',
      time: true
    }
  ]
};
