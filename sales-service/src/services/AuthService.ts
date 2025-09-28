import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest, AuthResponse, User } from '../types/index.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { config } from '../config.js';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async login(request: AuthRequest): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(request.email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(request.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

  async register(request: AuthRequest & { role?: string }): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(request.password, 12);
    
    const user = await this.userRepository.createUser({
      id: uuidv4(),
      email: request.email,
      password: hashedPassword,
      role: request.role || 'customer'
    });

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

  async createDefaultUsers(): Promise<void> {
    const defaultUsers = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        email: 'customer@example.com',
        password: 'customer123',
        role: 'customer'
      }
    ];

    for (const userData of defaultUsers) {
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await this.userRepository.createUser({
          id: uuidv4(),
          email: userData.email,
          password: hashedPassword,
          role: userData.role
        });
        console.log(`Created default user: ${userData.email}`);
      }
    }
  }
}
