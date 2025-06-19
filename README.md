# 3C Web Phone

A modern browser-based phone application built with Next.js, featuring SIP integration, real-time communication, user authentication, and administrative capabilities.

## Features

- 📞 Browser-based SIP phone functionality
- 💬 Real-time chat messaging
- 👥 Contact management
- 🔐 User authentication and authorization
- ⚙️ Admin panel for user and server management
- 🎨 Modern UI with Tailwind CSS
- 🔒 Secure communication

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v20 or higher)
- npm or yarn
- MongoDB instance
- SSL certificates (for HTTPS development)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/3cns/WebPhone.git
   cd WebPhone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://localhost:3000
   ```

4. **SSL Certificate Setup**
   Place your SSL certificates in the `certs` directory:
   - `certs/localhost.key`
   - `certs/localhost.crt`

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `https://localhost:3000`

## Project Structure

- `/src/app` - Next.js application routes and API endpoints
- `/src/components` - React components organized by feature
- `/src/hooks` - Custom React hooks including SIP provider
- `/src/lib` - Utility functions and database actions
- `/src/models` - MongoDB models and schemas
- `/src/types` - TypeScript type definitions
- `/src/utils` - Helper functions and utilities

## Key Features Documentation

### Authentication
- Sign up and sign in functionality
- JWT-based authentication
- Protected routes and API endpoints

### Phone Features
- SIP.js integration for WebRTC calls
- Real-time audio communication
- Call history and status display
- Dial pad with number input
- Contact management

### Admin Panel
- User management
- Server configuration
- System monitoring
- Access control

### Chat System
- Real-time messaging
- Message history
- Contact-based conversations
- Message status tracking

## Development

### Available Scripts

- `npm run dev` - Start development server with HTTPS
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

### Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **VoIP**: SIP.js
- **UI Components**: Headless UI, Heroicons

## Deployment

The application can be deployed to various platforms:

1. **Vercel** (Recommended)
   - Connect your repository to Vercel
   - Configure environment variables
   - Deploy automatically with git push

2. **Self-hosted**
   - Build the application: `npm run build`
   - Start the server: `npm run start`
   - Use process manager (PM2) for production
