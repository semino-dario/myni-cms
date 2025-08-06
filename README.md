# Myni CMS

> 🤖 **Developed with AI**: This project was built in collaboration with Claude (Anthropic's AI assistant) using Claude Sonnet 4, demonstrating AI-assisted full-stack development.

An integrable CMS for Next.js that integrates directly into monolithic projects, not headless.

## 🚧 Current Status

This repository contains a **functional CMS system** with comprehensive features. The core functionality is implemented and working with mock data.

**What's implemented:**

- ✅ Complete admin panel with navigation
- ✅ Dynamic content-types system with visual builder
- ✅ CRUD operations for content management
- ✅ Form system with validation (TextField, TextArea, Boolean, Date, Number, Media)
- ✅ Content-type constructor (add, remove, reorder fields)
- ✅ File upload system with media management
- ✅ TypeScript setup with path aliases
- ✅ SASS styling with CSS Modules
- ✅ Authentication system (basic implementation)
- ✅ RESTful API structure
- ✅ Next.js 15+ compatibility

**What's in development:**

- 🔄 Real database connections (currently using mocks)
- 🔄 Production-ready authentication
- 🔄 AWS S3 real integration
- 🔄 Search and filtering system
- 🔄 NPM packaging and distribution

## 🤖 AI-Assisted Development

This project showcases the capabilities of AI-assisted development:

- **AI Partner**: Claude Sonnet 4 (Anthropic)
- **Development Approach**: Collaborative pair programming with AI
- **Human Developer**: Darío Semino
- **Key Benefits Demonstrated**:
  - Rapid prototyping and iteration
  - Consistent code architecture
  - Comprehensive error handling
  - Best practices implementation
  - Real-time problem solving

The AI assistant helped with:

- System architecture design
- Component structure and organization
- TypeScript type definitions
- API design and implementation
- Styling and responsive design
- Error handling and validation
- Documentation and code organization

## 🚀 Features

- **Direct integration**: Integrates into your existing Next.js project, not headless
- **Dynamic content-types**: Create and configure custom content types via UI
- **Visual field builder**: Add, configure, and reorder fields with validation rules
- **Flexible database**: Architecture supports both MongoDB and PostgreSQL
- **Cloud storage ready**: AWS S3 integration for files and images
- **TypeScript native**: Fully typed throughout the application
- **Updatable**: Designed to update without affecting custom developer code
- **Modular architecture**: Complete separation between CMS core and user code

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript 5+
- **Styling**: SASS with CSS Modules
- **Database**: MongoDB / PostgreSQL adapters
- **Storage**: AWS S3 integration
- **Authentication**: JWT + bcrypt
- **UI Components**: Custom component system
- **Validation**: Zod schemas
- **File Processing**: Sharp for image optimization

## 📁 Project Structure

myni-cms/
├── src/
│ ├── cms/ # CMS Core (auto-updated)
│ │ ├── components/ # Reusable CMS components
│ │ ├── contexts/ # React contexts (Auth, etc.)
│ │ ├── types/ # TypeScript definitions
│ │ └── styles/ # CMS styling
│ ├── config/ # Configuration files
│ └── app/ # Next.js App Router
├── user-content/ # Developer safe zone (never updated)
│ ├── components/ # Custom components
│ ├── content-types/ # Custom content-type definitions
│ └── styles/ # Custom styling
├── public/ # Static assets
└── scripts/ # Installation and update scripts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Database (MongoDB or PostgreSQL)
- AWS S3 bucket (for production)

📋 Development Roadmap
Phase 1: Core Functionality ✅

Project structure and configuration
Admin panel with navigation
Content-type builder and management
Dynamic form system
CRUD operations
File upload system

Phase 2: Database Integration 🔄

MongoDB adapter implementation
PostgreSQL adapter implementation
Data migration system
Backup and restore functionality

Phase 3: Production Features 🔄

Robust authentication system
Real AWS S3 integration
Search and filtering
Performance optimizations
Caching system

Phase 4: Distribution 📋

NPM packaging
Installation scripts
Update mechanism
Documentation site
Plugin system

🎯 Demo
The project includes a fully functional demo with:

Content Types: Pre-configured "Article" content type
Admin Interface: Complete management panel
Form Builder: Visual content-type constructor
File Uploads: Media management system
Mock Data: Sample content for testing

🤝 Contributing
This project demonstrates AI-assisted development workflows. Contributions are welcome, especially:

Database adapter implementations
Additional field types
Plugin architecture
Performance improvements
Testing suite

📄 License
MIT License - see LICENSE file for details.
👥 Credits
Human Developer: Darío Semino
AI Assistant: Claude Sonnet 4 (Anthropic)
Development Method: AI-assisted pair programming
