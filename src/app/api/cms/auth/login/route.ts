import { NextRequest, NextResponse } from 'next/server';
import { createAuthService } from '@config/auth';
import { defaultConfig } from '@config/cms.config';

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN API CALLED ===');
    
    const body = await request.json();
    const { email, password } = body;
    
    console.log('Login attempt for:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const authService = createAuthService(defaultConfig);
    
    // DEMO CREDENTIALS - Not real secrets, for development only
    const DEMO_CREDENTIALS = [
      { email: 'demo.admin@example.test', password: 'demo_admin_pass_123', role: 'admin' as const },
      { email: 'demo.editor@example.test', password: 'demo_editor_pass_123', role: 'editor' as const },
    ];

    const validUser = DEMO_CREDENTIALS.find(
      cred => cred.email === email && cred.password === password
    );

    if (!validUser) {
      console.log('Invalid credentials for:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Valid user found:', validUser.email, validUser.role);

    const user = {
      id: validUser.role === 'admin' ? 'demo-admin-1' : 'demo-editor-1',
      email: validUser.email,
      role: validUser.role,
      name: validUser.role === 'admin' ? 'Demo Admin User' : 'Demo Editor User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const token = await authService.generateToken(user);
    
    console.log('Demo token generated, sending response');

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
