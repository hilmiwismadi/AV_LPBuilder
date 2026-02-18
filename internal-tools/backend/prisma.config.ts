import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://lpbuilder_user:lpbuilder_secure_pass_2024@localhost:5432/internal_tools_db?schema=public',
  },
});
