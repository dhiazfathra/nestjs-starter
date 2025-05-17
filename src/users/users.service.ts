import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(createUserDto.password);

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    // Remove password from the response
    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    return this.cacheService.getOrSet(
      'users:all',
      async () => {
        const users = await this.prisma.user.findMany();
        return users.map(({ password, ...rest }) => rest);
      },
      300 // Cache for 5 minutes
    );
  }

  async findOne(id: string) {
    return this.cacheService.getOrSet(
      `user:${id}`,
      async () => {
        const user = await this.prisma.user.findUnique({
          where: { id },
        });

        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }

        const { password, ...result } = user;
        return result;
      },
      300 // Cache for 5 minutes
    );
  }

  async findByEmail(email: string) {
    return this.cacheService.getOrSet(
      `user:email:${email}`,
      async () => {
        return this.prisma.user.findUnique({
          where: { email },
        });
      },
      300 // Cache for 5 minutes
    );
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    await this.findOne(id);

    // If updating email, check if new email is already in use
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    // If updating password, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    // Update the user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    // Invalidate cache for this user
    await this.cacheService.del(`user:${id}`);
    
    // If email was updated, invalidate the email cache
    if (updateUserDto.email) {
      await this.cacheService.del(`user:email:${updateUserDto.email}`);
    }
    
    // Invalidate the all users cache
    await this.cacheService.del('users:all');

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    // Check if user exists
    const user = await this.findOne(id);

    // Delete the user
    await this.prisma.user.delete({
      where: { id },
    });

    // Invalidate cache for this user
    await this.cacheService.del(`user:${id}`);
    
    // Invalidate the email cache
    if (user.email) {
      await this.cacheService.del(`user:email:${user.email}`);
    }
    
    // Invalidate the all users cache
    await this.cacheService.del('users:all');

    return { message: 'User deleted successfully' };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
