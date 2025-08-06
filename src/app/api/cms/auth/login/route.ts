import { NextRequest, NextResponse } from 'next/server';
import { createAuthService } from '@config/auth';
import { defaultConfig } from '@config/cms.config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const authService = createAuthService(defaultConfig);
    
    // Updated demo credentials with stronger passwords
    const validCredentials = [
      { email: 'admin@mynicms.com', password: 'MyniCMS2025!Admin', role: 'admin' as const },
      { email: 'editor@mynicms.com', password: 'MyniCMS2025!Editor', role: 'editor' as const },
    ];

    const validUser = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (!validUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create user object
    const user = {
      id: validUser.role === 'admin' ? 'admin-1' : 'editor-1',
      email: validUser.email,
      role: validUser.role,
      name: validUser.role === 'admin' ? 'Admin User' : 'Editor User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generate token
    const token = await authService.generateToken(user);

    return NextResponse.json({
      user,
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
