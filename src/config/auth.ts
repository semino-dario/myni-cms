import { CMSConfig } from './cms.config';

export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'editor';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthService {
  constructor(private config: CMSConfig) {}

  async hashPassword(password: string): Promise<string> {
    // bcrypt hash implementation
    console.log('Hashing password with rounds:', this.config.auth.bcryptRounds);
    return `hashed_${password}`;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    // bcrypt compare implementation
    console.log('Comparing password with hash');
    return hash === `hashed_${password}`;
  }

  async generateToken(user: Omit<User, 'password'>): Promise<string> {
    // JWT token generation
    const payload: Omit<AuthTokenPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    
    console.log('Generating JWT token for user:', user.email);
    return `jwt_token_${user.id}`;
  }

  async verifyToken(token: string): Promise<AuthTokenPayload | null> {
    // JWT token verification
    console.log('Verifying JWT token:', token);
    
    // Mock verification for now
    if (token.startsWith('jwt_token_')) {
      return {
        userId: token.replace('jwt_token_', ''),
        email: 'admin@example.com',
        role: 'admin',
        iat: Date.now(),
        exp: Date.now() + 86400000, // 24 hours
      };
    }
    
    return null;
  }

  async createUser(email: string, password: string, role: 'admin' | 'editor' = 'editor'): Promise<User> {
    // User creation
    const hashedPassword = await this.hashPassword(password);
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Creating user:', email, role);
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string } | null> {
    // User authentication
    console.log('Authenticating user:', email);
    
    // Mock authentication for now
    const user: User = {
      id: 'user_1',
      email,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const isValid = await this.comparePassword(password, `hashed_${password}`);
    
    if (isValid) {
      const { password: _, ...userWithoutPassword } = user;
      const token = await this.generateToken(userWithoutPassword);
      
      return {
        user: userWithoutPassword,
        token,
      };
    }

    return null;
  }
}

export function createAuthService(config: CMSConfig): AuthService {
  return new AuthService(config);
}
