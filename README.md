⚠️ **Work in Progress** - This is an initial setup and active development project. Not ready for production use.

An integrable CMS for Next.js that integrates directly into monolithic projects, not headless.

## 🚧 Current Status

This repository contains the **initial project setup** and foundational structure. Core functionality is being actively developed.

**What's implemented:**

- ✅ Project structure and configuration
- ✅ TypeScript setup with path aliases
- ✅ Next.js 14+ integration
- ✅ SASS configuration

**What's in development:**

- 🔄 Dynamic content-types system
- 🔄 Database adapters (MongoDB/PostgreSQL)
- 🔄 AWS S3 integration
- 🔄 Administration panel
- 🔄 Authentication system

## 🚀 Planned Features

- **Direct integration**: Integrates into your existing Next.js project, not headless
- **Dynamic content-types**: Create and configure custom content types
- **Flexible database**: Support for MongoDB and PostgreSQL
- **Cloud storage**: AWS S3 integration for files and images
- **TypeScript native**: Fully typed
- **Updatable**: Can be updated without affecting your custom code
- **Modular**: Completely separates CMS from your frontend application

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: SASS with CSS Modules
- **Database**: MongoDB / PostgreSQL (planned)
- **Storage**: AWS S3 (planned)
- **Authentication**: JWT + bcrypt (planned)

myni-cms/
├── src/cms/ # CMS Core (auto-updated)
├── user-content/ # Your custom code (safe zone)
├── app/ # Next.js routes (developer zone)
└── scripts/ # Installation and update scripts

## 📋 Development Roadmap

- [ ] Modular configuration system
- [ ] Dynamic content-types core
- [ ] Database adapters implementation
- [ ] Administration panel
- [ ] File management with S3
- [ ] Authentication system
- [ ] Installation and update scripts
- [ ] NPM publication

## 📄 License

MIT

## 👨‍💻 Author

Darío Semino

Built with ❤️ to simplify content management in Next.js
