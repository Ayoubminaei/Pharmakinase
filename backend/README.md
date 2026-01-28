# PharmaStudy Backend API

Production-ready Node.js/Express API with PostgreSQL database.

## Features

- 🔐 JWT Authentication
- 📊 PostgreSQL Database with Prisma ORM
- ☁️ Cloudinary Image Upload
- 🔍 Full-text Search
- 🛡️ Security (Helmet, Rate Limiting, CORS)
- ✅ Input Validation

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Allowed CORS origin |
| `PORT` | Server port (default: 3001) |

## API Documentation

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for full API reference.

## Deployment

### Railway (Recommended)

1. Push to GitHub
2. Connect Railway to repo
3. Add PostgreSQL addon
4. Set environment variables
5. Deploy!

### Render

1. Create Web Service
2. Set root directory to `backend`
3. Add PostgreSQL
4. Set environment variables
5. Deploy!
