import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seeds the database with an admin and a regular user, creating them if they do not exist.
 *
 * The users are initialized with predefined emails, names, roles, and a securely hashed password.
 *
 * @remark
 * If the users already exist, no updates are made to their records.
 */
async function main() {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('admin123', saltRounds);

  // Create admin user
  let admin = await prisma.user.findFirst({
    where: {
      email: 'admin@example.com',
      isDeleted: false,
    },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: Role.ADMIN,
      },
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  // Create regular user
  let user = await prisma.user.findFirst({
    where: {
      email: 'user@example.com',
      isDeleted: false,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: hashedPassword,
        firstName: 'Regular',
        lastName: 'User',
        role: Role.USER,
      },
    });
    console.log('Regular user created');
  } else {
    console.log('Regular user already exists');
  }

  console.log({ admin, user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
