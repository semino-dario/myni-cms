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
    
    // Demo credentials loaded from environment variables
    const demoCredentials = [
      { 
        email: process.env.DEMO_ADMIN_EMAIL || 'demo.admin@example.test', 
        password: process.env.DEMO_ADMIN_PASSWORD || 'demo_pass_123', 
        role: 'admin' as const 
      },
      { 
        email: process.env.DEMO_EDITOR_EMAIL || 'demo.editor@example.test', 
        password: process.env.DEMO_EDITOR_PASSWORD || 'demo_pass_456', 
        role: 'editor' as const 
      },
    ];

    const validUser = demoCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (!validUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = {
      id: validUser.role === 'admin' ? 'demo-admin-1' : 'demo-editor-1',
      email: validUser.email,
      role: validUser.role,
      name: validUser.role === 'admin' ? 'Demo Admin User' : 'Demo Editor User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const token = await authService.generateToken(user);

    return NextResponse.json({
      user,
      token,
      message: 'Demo login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
