import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Check if admin user already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: "admin@arachnova.id" }
  });

  if (existingAdmin) {
    console.log("Admin user already exists, skipping seed");
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create default admin user
  const admin = await prisma.admin.create({
    data: {
      email: "admin@arachnova.id",
      password: hashedPassword,
      name: "Super Admin",
      role: "SUPERADMIN"
    }
  });

  console.log("Admin user created successfully:", {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role
  });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
