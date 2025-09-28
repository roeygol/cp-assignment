import { jest } from '@jest/globals';
import { AuthService } from '../../services/AuthService.js';
import { UserRepository } from '../../repositories/UserRepository.js';
import { AuthRequest, User } from '../../types/index.js';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
    };

    authService = new AuthService(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginRequest: AuthRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      const bcrypt = await import('bcryptjs');
      (bcrypt.compare as any).mockResolvedValue(true);
      const jwt = await import('jsonwebtoken');
      (jwt.sign as any).mockReturnValue('mock-jwt-token');

      const result = await authService.login(loginRequest);

      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'customer',
        },
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginRequest)).rejects.toThrow('Invalid credentials');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw error when password is invalid', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      const bcrypt = await import('bcryptjs');
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(authService.login(loginRequest)).rejects.toThrow('Invalid credentials');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('register', () => {
    const registerRequest: AuthRequest & { role?: string } = {
      email: 'newuser@example.com',
      password: 'password123',
      role: 'customer',
    };

    it('should register successfully with new user', async () => {
      const mockCreatedUser: User = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        password: 'hashed-password',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      const bcrypt = await import('bcryptjs');
      (bcrypt.hash as any).mockResolvedValue('hashed-password');
      mockUserRepository.createUser.mockResolvedValue(mockCreatedUser);
      const jwt = await import('jsonwebtoken');
      (jwt.sign as any).mockReturnValue('mock-jwt-token');

      const result = await authService.register(registerRequest);

      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: {
          id: 'new-user-123',
          email: 'newuser@example.com',
          role: 'customer',
        },
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should throw error when user already exists', async () => {
      const existingUser: User = {
        id: 'existing-user-123',
        email: 'newuser@example.com',
        password: 'hashed-password',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(authService.register(registerRequest)).rejects.toThrow('User already exists');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('newuser@example.com');
    });
  });

  describe('createDefaultUsers', () => {
    it('should create default users when they do not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      const bcrypt = await import('bcryptjs');
      (bcrypt.hash as any).mockResolvedValue('hashed-password');
      mockUserRepository.createUser.mockResolvedValue({
        id: 'user-id',
        email: 'admin@example.com',
        password: 'hashed-password',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await authService.createDefaultUsers();

      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('admin@example.com');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('customer@example.com');
      expect(bcrypt.hash).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.createUser).toHaveBeenCalledTimes(2);
    });

    it('should not create users when they already exist', async () => {
      const existingUser: User = {
        id: 'existing-user',
        email: 'admin@example.com',
        password: 'hashed-password',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await authService.createDefaultUsers();

      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });
  });
});