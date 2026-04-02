# PulseBridge - Event and Volunteer Platform

## Project Overview
PulseBridge is a Node.js + Express.js project for managing community events, organizations, posts, and event subscriptions.

The project contains:
- Server-rendered web app (EJS + Bootstrap)
- JWT-protected API endpoints for auth, profile, and events
- MongoDB database with 5 collections
- RBAC logic (`admin` and `user`)
- Email notifications and reminders for event subscriptions

## Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- EJS + Bootstrap 5
- Joi validation
- JWT authentication
- bcryptjs password hashing
- multer image upload
- nodemailer email notifications

## Project Structure
```text
src/
  app.js
  server.js
  config/
  controllers/
  middleware/
  models/
  modules/
  routes/
  services/
  utils/
  validators/
  views/
  public/
```

## Setup Instructions
1. Install dependencies:
```bash
npm install
```

2. Create `.env` from `.env.example`.

3. Run the app:
```bash
npm run dev
```

4. Open:
- `http://localhost:4000`

## Environment Variables
Required values:
- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

For email reminders:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `REMINDER_INTERVAL_MS`

## Database Collections
1. `User`
- `username`, `email`, `password`, `avatar`, `role`

2. `Event`
- `title`, `description`, `imageUrl`, `location`, `startDate`, `endDate`, `capacity`, `organization`, `owner`

3. `Organization`
- `name`, `description`, `imageUrl`, `members`, `owner`

4. `Post`
- `title`, `content`, `event`, `author`

5. `VolunteerShift` (used as event subscription)
- `event`, `volunteer`, `status`, `reminderHours`, `reminderSent`

## Authentication and Security
- Passwords are hashed with `bcryptjs`
- JWT is used for API authentication
- API private routes require `Authorization: Bearer <token>`
- Web authentication uses `httpOnly` cookie `pb_token`
- Rate-limit is applied for login/register form submissions
- Global error middleware handles validation, JWT, and DB errors

## RBAC Rules
- `admin` can edit/delete any resource
- `user` can edit/delete only owned resources
- Users cannot subscribe to their own event

## API Documentation
Base URL: `http://localhost:4000`

### Public Auth
- `POST /api/auth/register`
  - Body:
  ```json
  {
    "username": "alex",
    "email": "alex@example.com",
    "password": "12345678"
  }
  ```

- `POST /api/auth/login`
  - Body:
  ```json
  {
    "email": "alex@example.com",
    "password": "12345678"
  }
  ```

### Private User
- `GET /api/users/profile`
- `PUT /api/users/profile`
  - Body:
  ```json
  {
    "username": "alex_new",
    "email": "alex_new@example.com"
  }
  ```

### Private Event Resource
- `POST /api/events`
- `GET /api/events`
- `GET /api/events/:id`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

Example create body:
```json
{
  "title": "Community Concert",
  "description": "Live event for volunteers",
  "imageUrl": "https://example.com/concert.jpg",
  "location": "Bishkek",
  "startDate": "2026-03-10T18:00:00.000Z",
  "endDate": "2026-03-10T21:00:00.000Z",
  "capacity": 200,
  "organization": "65f0c2d9a3f1b2c3d4e5f678"
}
```

## Main Web Pages (Bootstrap)
- `/` home
- `/login`, `/register`
- `/profile`
- `/dashboard`
- `/events`, `/events/new`, `/events/:id`, `/events/:id/edit`
- `/organizations`, `/organizations/new`, `/organizations/:id`, `/organizations/:id/edit`
- `/posts`, `/posts/new`, `/posts/:id`, `/posts/:id/edit`
- `/shifts` (followed events)
- `/users/:id` (public user profile)

## Email Reminder Feature
- On event subscription, user gets confirmation email
- Default reminder is `24` hours before event
- User can change reminder hours on `/shifts`
- Background service checks subscriptions and sends reminder emails automatically

## Health Check
- `GET /health`
