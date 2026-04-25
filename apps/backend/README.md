# Company Intelligence Platform - Backend

A modular Node.js backend built with Express, TypeScript, and MongoDB.

## Features

- **TypeScript** for type safety
- **Express** with middleware (Helmet, CORS, Morgan)
- **Mongoose** for MongoDB ODM
- **Environment configuration** with dotenv
- **Custom error handling** with AppError class
- **Path aliases** for clean imports
- **Health check endpoint**
- **Graceful shutdown**
- **User Follow System** – Follow/unfollow users with real-time follower counts

## Project Structure

```
src/
├── config/          # Database and configuration
├── controllers/     # Business logic
├── models/          # Mongoose schemas
├── routes/          # API endpoints
├── middleware/      # Custom middleware (auth, validation, error handling)
├── utils/           # Helper functions, custom errors
├── types/           # TypeScript interfaces
└── server.ts        # Entry point
```

## API Endpoints

### User Follow System

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| PATCH  | `/api/v1/users/:userId/follow` | Toggle follow/unfollow a user | Required (x-user-id header) |
| GET    | `/api/v1/users/:userId/follow-stats` | Get user's followers/following counts | Public |
| GET    | `/api/v1/users/:userId/follow-status` | Check if current user is following target user | Required |

**Authentication Note**: In production, authentication should be handled via JWT middleware. For testing, you can pass `x-user-id` header with the current user's ID.

### Example Request (Follow)
```bash
curl -X PATCH http://localhost:5000/api/v1/users/507f1f77bcf86cd799439011/follow \
  -H "x-user-id: 507f1f77bcf86cd799439012" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "action": "follow",
  "message": "You are now following johndoe",
  "data": {
    "followingCount": 5,
    "followersCount": 10,
    "isFollowing": true,
    "targetUser": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "avatarUrl": "",
      "followersCount": 10
    },
    "currentUser": {
      "id": "507f1f77bcf86cd799439012",
      "username": "janedoe",
      "followingCount": 5
    }
  }
}
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or remote)

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd apps/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Update the `.env` file with your MongoDB URI and other settings.

### Running the Server

**Development** (with hot reload):
```bash
npm run dev
```

**Production build**:
```bash
npm run build
npm start
```

### Health Check

Once running, visit `http://localhost:5000/api/v1/health` to verify the server status.

## Scripts

- `npm run dev` – Start development server with nodemon
- `npm run build` – Compile TypeScript to JavaScript
- `npm start` – Start production server
- `npm run lint` – Run ESLint
- `npm test` – Run tests (to be implemented)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/company_intelligence_db |
| JWT_SECRET | Secret for signing JWT tokens | (required) |
| JWT_EXPIRY | JWT expiration time | 7d |
| NODE_ENV | Environment (development/production) | development |
| CORS_ORIGIN | Allowed origin for CORS | * |

## Error Handling

The backend uses a custom `AppError` class for operational errors. Global error middleware catches and formats errors consistently.

## Path Aliases

Configured in `tsconfig.json` for cleaner imports:

- `@config/*` → `src/config/*`
- `@controllers/*` → `src/controllers/*`
- `@models/*` → `src/models/*`
- `@routes/*` → `src/routes/*`
- `@middleware/*` → `src/middleware/*`
- `@utils/*` → `src/utils/*`
- `@types/*` → `src/types/*`

## License

MIT