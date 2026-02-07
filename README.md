# PulseBridge - Event & Volunteer Platform

## Project Overview
PulseBridge is a Node.js + Express.js platform for organizing community events and coordinating volunteers. It uses MongoDB for data storage, JWT for authentication, and RBAC for role-based permissions.

The project follows a modular structure with separate folders for routes, controllers, models, middleware, services, validators, configuration, and modules.

## Tech Stack
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Joi Validation
- Bootstrap 5 (responsive UI)
- EJS Server-Rendered Views

## Project Structure
```
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
  public/
```

## Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file using `.env.example`.
3. Run the server:
   ```bash
   npm run dev
   ```

Default server URL: `http://localhost:4000`

## Database Collections (5+)
- **User**: username, email, password, role
- **Event**: title, description, imageUrl, location, startDate, endDate, status, capacity, owner
- **Organization**: name, description, owner
- **VolunteerShift**: event, volunteer, startTime, endTime, status
- **Post**: title, content, author, event

## Authentication & Security
- Passwords hashed with bcrypt.
- JWT used for authentication (API uses Bearer token, web uses httpOnly cookie).
- Protected routes require `Authorization: Bearer <token>` for API.
- RBAC: `admin` can delete events/organizations/posts; users can update only their own events/posts/organizations and their shifts.

## API Documentation
Base URL: `/api`

### Auth (Public)
- **POST** `/register` (HTML form submission)
- **POST** `/login` (HTML form submission)
- **POST** `/api/auth/register` (JSON API)
  - Body: `{ "username", "email", "password" }`
- **POST** `/api/auth/login` (JSON API)
  - Body: `{ "email", "password" }`

### User (Private)
- **GET** `/users/profile`
- **PUT** `/users/profile`
  - Body: `{ "username"?, "email"? }`

### Event Resource (Private)
- **POST** `/events`
  - Body: `{ "title", "description", "imageUrl", "location"?, "startDate", "endDate"?, "status"?, "capacity"?, "organization"? }`
- **GET** `/events`
  - Returns events for the logged-in user (admin sees all).
- **GET** `/events/:id`
- **PUT** `/events/:id`
  - Updates only if owner or admin.
- **DELETE** `/events/:id`
  - Admin only.

## Pages (Bootstrap)
- `/` Landing page
- `/login` Login UI
- `/register` Registration UI
- `/profile` Profile page (uses `/api/users/profile`)
- `/events` Events list
- `/events/new` Create event (HTML form)
- `/events/:id` Event details page
- `/events/:id/edit` Edit event (owner/admin)
- `/organizations` Organizations list
- `/organizations/new` Create organization
- `/organizations/:id` Organization details + events
- `/posts` Impact posts
- `/posts/new` Create post
- `/posts/:id` Post details
- `/posts/:id/edit` Edit post (author/admin)
- `/shifts` Volunteer shifts (per user/admin)
- `/shifts/new` Create shift
- `/shifts/:id/edit` Edit shift (owner/admin)
- `/dashboard` Volunteer dashboard

## Notes for Defence
Be ready to explain:
- JWT authentication flow
- RBAC decisions
- Data models & relationships
- Global error handling and validation pipeline
