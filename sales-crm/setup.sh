#!/bin/bash

echo "========================================"
echo "Sales CRM Setup Script"
echo "========================================"

# Check if PostgreSQL database exists
echo "\n1. Setting up database..."
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw sales_crm_db
if [ 0 -ne 0 ]; then
    echo "Creating database: sales_crm_db"
    sudo -u postgres createdb sales_crm_db
else
    echo "Database sales_crm_db already exists"
fi

# Backend setup
echo "\n2. Setting up backend..."
cd /home/adminlpuilder/AV_LPBuilder/sales-crm/backend

# Create .env file
cat > .env << 'EOF'
DATABASE_URL="postgresql://lpbuilder:lpbuilder123@localhost:5432/sales_crm_db?schema=public"
PORT=3002
NODE_ENV=production
JWT_ACCESS_SECRET="sales-crm-jwt-secret-change-in-production"
JWT_REFRESH_SECRET="sales-crm-refresh-secret-change-in-production"
COOKIE_DOMAIN=".arachnova.id"
EOF

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed database
echo "Seeding database..."
npx prisma db seed

# Frontend setup
echo "\n3. Setting up frontend..."
cd /home/adminlpuilder/AV_LPBuilder/sales-crm/frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "\n========================================"
echo "Setup complete!"
echo "========================================"
echo "\nTo start the application:"
echo "  pm2 start ecosystem.config.cjs"
echo "\nTo check status:"
echo "  pm2 status"
echo "\nTo view logs:"
echo "  pm2 logs sales-crm"
echo "\nLogin credentials:"
echo "  Email: admin@arachnova.id"
echo "  Password: admin123"
echo "\nURL: http://sales.arachnova.id"
echo "========================================"
