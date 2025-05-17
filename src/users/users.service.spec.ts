import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let cacheService: CacheService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    getOrSet: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    };

    it('should create a new user and return it without password', async () => {
      const hashedPassword = 'hashedPassword';
      const createdUser = {
        id: '1',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'USER',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should use cache service to get or set users', async () => {
      const users = [
        {
          id: '1',
          email: 'user1@example.com',
          password: 'hashedPassword1',
          name: 'User 1',
          role: 'USER',
        },
        {
          id: '2',
          email: 'user2@example.com',
          password: 'hashedPassword2',
          name: 'User 2',
          role: 'ADMIN',
        },
      ];

      const expectedResult = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          role: 'USER',
        },
        {
          id: '2',
          email: 'user2@example.com',
          name: 'User 2',
          role: 'ADMIN',
        },
      ];

      // Mock the getOrSet method to call the factory function and return its result
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        expect(key).toBe('users:all');
        return factory();
      });

      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'users:all',
        expect.any(Function),
        300,
      );
      expect(prismaService.user.findMany).toHaveBeenCalled();
    });

    it('should return cached users when available', async () => {
      const cachedUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          role: 'USER',
        },
      ];

      // Mock the getOrSet method to return the cached value without calling the factory
      mockCacheService.getOrSet.mockResolvedValue(cachedUsers);

      const result = await service.findAll();

      expect(result).toEqual(cachedUsers);
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'users:all',
        expect.any(Function),
        300,
      );
      expect(prismaService.user.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should use cache service to get or set user by id', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
      };

      const expectedResult = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };

      // Mock the getOrSet method to call the factory function and return its result
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        expect(key).toBe('user:1');
        return factory();
      });

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'user:1',
        expect.any(Function),
        300,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return cached user when available', async () => {
      const cachedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };

      // Mock the getOrSet method to return the cached value without calling the factory
      mockCacheService.getOrSet.mockResolvedValue(cachedUser);

      const result = await service.findOne('1');

      expect(result).toEqual(cachedUser);
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'user:1',
        expect.any(Function),
        300,
      );
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is not found', async () => {
      // Mock the getOrSet method to call the factory function which throws an error
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        return factory();
      });

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'user:1',
        expect.any(Function),
        300,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('findByEmail', () => {
    it('should use cache service to get or set user by email', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
      };

      // Mock the getOrSet method to call the factory function and return its result
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        expect(key).toBe('user:email:test@example.com');
        return factory();
      });

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(user);
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'user:email:test@example.com',
        expect.any(Function),
        300,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return cached user when available', async () => {
      const cachedUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
      };

      // Mock the getOrSet method to return the cached value without calling the factory
      mockCacheService.getOrSet.mockResolvedValue(cachedUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(cachedUser);
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'user:email:test@example.com',
        expect.any(Function),
        300,
      );
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return null when user is not found by email', async () => {
      // Mock the getOrSet method to call the factory function which returns null
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        return factory();
      });

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'user:email:nonexistent@example.com',
        expect.any(Function),
        300,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('update', () => {
    const updateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update user, invalidate cache, and return user without password', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
      };

      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Updated',
        lastName: 'Name',
        role: 'USER',
      };

      // Mock the getOrSet method for findOne
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        return factory();
      });

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'Name',
        role: 'USER',
      });

      // Verify cache invalidation
      expect(cacheService.del).toHaveBeenCalledWith('user:1');
      expect(cacheService.del).toHaveBeenCalledWith('users:all');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateUserDto,
      });
    });

    it('should invalidate email cache when email is updated', async () => {
      const existingUser = {
        id: '1',
        email: 'old@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
      };

      const updateWithEmailDto = {
        email: 'new@example.com',
      };

      const updatedUser = {
        id: '1',
        email: 'new@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
      };

      // Mock the getOrSet method for findOne
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        return factory();
      });

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(existingUser) // For findOne
        .mockResolvedValueOnce(null); // For checking if email exists

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateWithEmailDto);

      expect(result).toEqual({
        id: '1',
        email: 'new@example.com',
        name: 'Test User',
        role: 'USER',
      });

      // Verify cache invalidation
      expect(cacheService.del).toHaveBeenCalledWith('user:1');
      expect(cacheService.del).toHaveBeenCalledWith(
        'user:email:new@example.com',
      );
      expect(cacheService.del).toHaveBeenCalledWith('users:all');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateWithEmailDto,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Mock the getOrSet method to throw NotFoundException
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        return factory();
      });

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'user:1',
        expect.any(Function),
        300,
      );
      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(cacheService.del).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if updating email to one that already exists', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
      };

      const anotherUser = {
        id: '2',
        email: 'new@example.com',
        password: 'hashedPassword',
        name: 'Another User',
        role: 'USER',
      };

      const updateWithEmailDto = {
        email: 'new@example.com',
      };

      // Mock the getOrSet method for findOne
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        return factory();
      });

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(anotherUser);

      await expect(service.update('1', updateWithEmailDto)).rejects.toThrow(
        ConflictException,
      );

      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(cacheService.del).not.toHaveBeenCalled();
    });

    it('should hash password if included in update', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'oldHashedPassword',
        name: 'Test User',
        role: 'USER',
      };

      const updateWithPasswordDto = {
        password: 'newPassword',
      };

      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        password: 'newHashedPassword',
        name: 'Test User',
        role: 'USER',
      };

      // Mock the getOrSet method for findOne
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        return factory();
      });

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateWithPasswordDto);

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      });

      // Verify cache invalidation
      expect(cacheService.del).toHaveBeenCalledWith('user:1');
      expect(cacheService.del).toHaveBeenCalledWith('users:all');

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'newHashedPassword' },
      });
    });
  });

  describe('remove', () => {
    it('should delete user, invalidate cache, and return success message', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
      };

      // Mock the getOrSet method for findOne
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        return factory();
      });

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.delete.mockResolvedValue(user);

      const result = await service.remove('1');

      expect(result).toEqual({ message: 'User deleted successfully' });

      // Verify cache invalidation
      expect(cacheService.del).toHaveBeenCalledWith('user:1');
      expect(cacheService.del).toHaveBeenCalledWith(
        'user:email:test@example.com',
      );
      expect(cacheService.del).toHaveBeenCalledWith('users:all');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Mock the getOrSet method to throw NotFoundException
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        return factory();
      });

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);

      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'user:1',
        expect.any(Function),
        300,
      );
      expect(prismaService.user.delete).not.toHaveBeenCalled();
      expect(cacheService.del).not.toHaveBeenCalled();
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'password';
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await (service as any).hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });
});
