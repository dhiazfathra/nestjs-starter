import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Email } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetEmailsDto } from './dto/get-emails.dto';
import { EmailService } from './email.service';

// Mock external modules
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({}),
    }),
  };
});

jest.mock('imap');
jest.mock('poplib');
jest.mock('mailparser');

describe('EmailService Additional Tests', () => {
  let service: EmailService;
  let _prismaService: PrismaService;

  // Create mock PrismaService
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    email: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('fetchEmailsIMAP', () => {
    it('should throw NotFoundException when user is not found', async () => {
      const userId = 'user-id';
      const options: GetEmailsDto = { folder: 'INBOX', page: 1, limit: 10 };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.fetchEmailsIMAP(userId, options)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw Error when IMAP is not enabled', async () => {
      const userId = 'user-id';
      const options: GetEmailsDto = { folder: 'INBOX', page: 1, limit: 10 };

      const mockUser = {
        id: userId,
        emailHost: 'imap.example.com',
        emailPort: 993,
        emailUsername: 'user@example.com',
        emailPassword: 'password',
        emailSecure: true,
        imapEnabled: false, // IMAP not enabled
        pop3Enabled: true,
        smtpEnabled: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.fetchEmailsIMAP(userId, options)).rejects.toThrow(
        'User not found or IMAP not enabled',
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw Error when email configuration is incomplete', async () => {
      const userId = 'user-id';
      const options: GetEmailsDto = { folder: 'INBOX', page: 1, limit: 10 };

      const mockUser = {
        id: userId,
        emailHost: '', // Missing host
        emailPort: 993,
        emailUsername: 'user@example.com',
        emailPassword: 'password',
        emailSecure: true,
        imapEnabled: true,
        pop3Enabled: true,
        smtpEnabled: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.fetchEmailsIMAP(userId, options)).rejects.toThrow(
        'Email configuration is incomplete',
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('fetchEmailsPOP3', () => {
    it('should throw Error when user is not found', async () => {
      const userId = 'user-id';
      const options: GetEmailsDto = { folder: 'INBOX', page: 1, limit: 10 };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.fetchEmailsPOP3(userId, options)).rejects.toThrow(
        'POP3 is not enabled for this user',
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw Error when POP3 is not enabled', async () => {
      const userId = 'user-id';
      const options: GetEmailsDto = { folder: 'INBOX', page: 1, limit: 10 };

      const mockUser = {
        id: userId,
        emailHost: 'pop.example.com',
        emailPort: 995,
        emailUsername: 'user@example.com',
        emailPassword: 'password',
        emailSecure: true,
        imapEnabled: true,
        pop3Enabled: false, // POP3 not enabled
        smtpEnabled: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.fetchEmailsPOP3(userId, options)).rejects.toThrow(
        'POP3 is not enabled for this user',
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw Error when email configuration is incomplete', async () => {
      const userId = 'user-id';
      const options: GetEmailsDto = { folder: 'INBOX', page: 1, limit: 10 };

      const mockUser = {
        id: userId,
        emailHost: '', // Missing host
        emailPort: 995,
        emailUsername: 'user@example.com',
        emailPassword: 'password',
        emailSecure: true,
        imapEnabled: true,
        pop3Enabled: true,
        smtpEnabled: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.fetchEmailsPOP3(userId, options)).rejects.toThrow(
        'Email configuration is incomplete',
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  // describe('updateEmailConfig', () => {
  //   it('should update email configuration', async () => {
  //     const userId = 'user-id';
  //     const config = {
  //       emailHost: 'smtp.example.com',
  //       emailPort: 587,
  //       emailUsername: 'test@example.com',
  //       emailPassword: 'password',
  //       emailSecure: true,
  //       imapEnabled: true,
  //       smtpEnabled: true,
  //       pop3Enabled: false,
  //     };

  //     const mockUser = {
  //       id: userId,
  //       ...config,
  //     };

  //     mockPrismaService.user.update.mockResolvedValue(mockUser);

  //     const result = await service.updateEmailConfig(userId, config);

  //     expect(result).toEqual(config);
  //     expect(mockPrismaService.user.update).toHaveBeenCalledWith({
  //       where: { id: userId },
  //       data: config,
  //     });
  //   });
  // });

  describe('saveEmailsToDatabase', () => {
    it('should save emails to database', async () => {
      const userId = 'user-id';
      const emails: Partial<Email>[] = [
        {
          messageId: 'message-id-1',
          from: 'sender@example.com',
          to: ['recipient@example.com'],
          subject: 'Test Subject',
          text: 'Test content',
          html: '<p>Test content</p>',
          receivedAt: new Date(),
          folder: 'INBOX',
        },
      ];

      mockPrismaService.email.findFirst.mockResolvedValue(null);
      mockPrismaService.email.create.mockResolvedValue({} as Email);

      await service.saveEmailsToDatabase(emails as Partial<Email>[], userId);

      expect(mockPrismaService.email.findFirst).toHaveBeenCalledWith({
        where: {
          messageId: 'message-id-1',
          userId,
        },
      });
      expect(mockPrismaService.email.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          messageId: 'message-id-1',
          from: 'sender@example.com',
          to: ['recipient@example.com'],
          subject: 'Test Subject',
          text: 'Test content',
          html: '<p>Test content</p>',
          folder: 'INBOX',
          userId,
        }),
      });
    });

    it('should not save duplicate emails', async () => {
      const userId = 'user-id';
      const emails: Partial<Email>[] = [
        {
          messageId: 'message-id-1',
          from: 'sender@example.com',
          to: ['recipient@example.com'],
          subject: 'Test Subject',
          text: 'Test content',
          html: '<p>Test content</p>',
          receivedAt: new Date(),
          folder: 'INBOX',
        },
      ];

      mockPrismaService.email.findFirst.mockResolvedValue({
        id: 'existing-id',
        messageId: 'message-id-1',
      } as Email);

      await service.saveEmailsToDatabase(emails as Partial<Email>[], userId);

      expect(mockPrismaService.email.findFirst).toHaveBeenCalledWith({
        where: {
          messageId: 'message-id-1',
          userId,
        },
      });
      expect(mockPrismaService.email.create).not.toHaveBeenCalled();
    });
  });
});
