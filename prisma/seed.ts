import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Creates a user if they do not exist.
 *
 * @param email - The email of the user.
 * @param firstName - The first name of the user.
 * @param lastName - The last name of the user.
 * @param role - The role of the user.
 * @param hashedPassword - The hashed password of the user.
 * @param userType - The type of the user.
 * @returns The created user.
 */
async function createUserIfNotExists(
  email: string,
  firstName: string,
  lastName: string,
  role: Role,
  hashedPassword: string,
  userType: string,
) {
  let user = await prisma.user.findFirst({
    where: {
      email,
      isDeleted: false,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });
    console.log(`${userType} user created`);
  } else {
    console.log(`${userType} user already exists`);
  }

  return user;
}

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
  const admin = await createUserIfNotExists(
    'admin@example.com',
    'Admin',
    'User',
    Role.ADMIN,
    hashedPassword,
    'Admin',
  );

  // Create regular user
  const user = await createUserIfNotExists(
    'user@example.com',
    'Regular',
    'User',
    Role.USER,
    hashedPassword,
    'User',
  );

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
