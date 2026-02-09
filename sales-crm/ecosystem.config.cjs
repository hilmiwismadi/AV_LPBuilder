module.exports = {
  apps: [
    {
      name: 'sales-crm-backend',
      cwd: '/home/adminlpuilder/AV_LPBuilder/sales-crm/backend',
      script: 'src/index.js',
      env: {
        PORT: 3002,
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://lpbuilder_user:lpbuilder_secure_pass_2024@localhost:5432/sales_crm_db?schema=public',
        JWT_ACCESS_SECRET: 'sales-crm-jwt-secret-ZbDME7rErT2tgAVKsNvrpdDES2ZfPUAKPLp2ehPsR',
        JWT_REFRESH_SECRET: 'sales-crm-refresh-mZD2G1zbxGKIt6DkjqtEqxIpSBOqgOjCnH+KmXPgUoI',
        COOKIE_DOMAIN: '.arachnova.id'
      }
    },
    {
      name: 'sales-crm-frontend',
      cwd: '/home/adminlpuilder/AV_LPBuilder/sales-crm/frontend',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0 --port 5174',
      env: {
        NODE_ENV: 'production',
        VITE_API_URL: 'http://sales.arachnova.id/api'
      }
    }
  ]
};
