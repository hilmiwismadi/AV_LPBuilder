import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Check if superadmin already exists
  const existingSuperadmin = await prisma.user.findFirst({
    where: { role: 'SUPERADMIN' }
  });

  if (existingSuperadmin) {
    console.log('Superadmin already exists:', existingSuperadmin.email);
    return;
  }

  // Create superadmin user
  const hashedPassword = await bcrypt.hash('Admin@2024', 10);
  
  const superadmin = await prisma.user.create({
    data: {
      email: 'admin@arachnova.id',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'SUPERADMIN'
    }
  });

  console.log('Superadmin created:', superadmin.email);
  console.log('Default password: Admin@2024');

  // Assign all existing configurations to superadmin
  const configurationsCount = await prisma.configuration.updateMany({
    where: { ownerId: null },
    data: { ownerId: superadmin.id }
  });

  console.log(`Assigned ${configurationsCount.count} existing configurations to superadmin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
