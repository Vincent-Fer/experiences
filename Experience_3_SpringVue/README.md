# Experience 3 - Spring Boot + Vue.js
## Project made with mistral-large-3 in agent mode

This project is a migration of the original Flask application to a modern architecture with:
- **Backend**: Java Spring Boot
- **Frontend**: Vue.js 3 with Vite

## Project Structure

```
Experience_3_SpringVue/
├── backend/          # Spring Boot application
├── frontend/         # Vue.js application
└── README.md         # This file
```

## Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.6+
- Git

## Backend Setup (Spring Boot)

1. Navigate to the backend directory:
```bash
cd Experience_3_SpringVue/backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## Frontend Setup (Vue.js)

1. Navigate to the frontend directory:
```bash
cd Experience_3_SpringVue/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:
```properties
# Database configuration
spring.datasource.url=jdbc:sqlite:experience3.db
spring.datasource.driver-class-name=org.sqlite.JDBC

# Server configuration
server.port=8080

# CORS configuration
app.cors.allowed-origins=http://localhost:3000
```

### Frontend Configuration

The frontend is configured to proxy API requests to the backend. Edit `frontend/vite.config.js` if you need to change the proxy settings:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    secure: false
  }
}
```

## Database Setup

The application uses SQLite. The database file `experience3.db` will be created automatically in the backend directory when you first run the application.

## Running the Application

1. Start the backend:
```bash
cd backend
mvn spring-boot:run
```

2. In a separate terminal, start the frontend:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Features

- User authentication
- Session management
- Game interface with vessel information
- Timer functionality
- Feedback system
- Questionnaire forms

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Check session status

### Game
- `GET /api/game/data/{session}` - Get game data for session
- `GET /api/game/feedback/{session}` - Get feedback for session
- `GET /api/game/rank/{session}` - Get rank data for session
- `POST /api/game/update-session` - Update session
- `GET /api/game/can-start-session/{session}` - Check if session can be started

### Timer
- `GET /api/timer/state/{code}` - Get timer state

### Choice
- `POST /api/choice/update` - Update user choice

## Development

### Backend Development

- The main application class is `Experience3Application.java`
- Controllers are in the `com.experience3.controller` package
- Services are in the `com.experience3.service` package
- Entities are in the `com.experience3.entity` package
- Repositories are in the `com.experience3.repository` package

### Frontend Development

- Main application entry: `frontend/src/main.js`
- Router configuration: `frontend/src/router/index.js`
- State management: `frontend/src/stores/`
- Views: `frontend/src/views/`
- Components: `frontend/src/components/`

## Building for Production

### Backend
```bash
mvn clean package
```

### Frontend
```bash
npm run build
```

The built frontend files will be in the `dist` directory and can be served by the Spring Boot backend or any static file server.
