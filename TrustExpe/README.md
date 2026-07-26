# TrustExpe Application with PostgreSQL

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Docker (for PostgreSQL container)
- Docker Compose

### Running the Application

1. **Start PostgreSQL Database**:
   ```bash
   docker-compose up -d
   ```

2. **Run the Spring Boot Application**:
   ```bash
   ./gradlew bootRun
   ```

3. **Stop the Services**:
   ```bash
   docker-compose down
   ```

### Development Configuration

The application uses:
- PostgreSQL as the production database (running in Docker)
- Spring Boot with JPA for data access

### Database Configuration

- **Host**: localhost
- **Port**: 5432
- **Database**: trust_expe
- **Username**: postgres
- **Password**: postgres

### Testcontainers

The application includes Testcontainers configuration for testing:
- Automatically starts a PostgreSQL container when running tests
- Configured in `src/test/java/com/trust/expe/config/TestDatabaseConfig.java`

### Running Tests

```bash
./gradlew test
```

This will automatically start a PostgreSQL container for testing and stop it when tests complete.

### Troubleshooting

If you encounter issues with Docker:
1. Make sure Docker Desktop is running
2. Verify the PostgreSQL container is running with `docker ps`
3. Check the logs with `docker-compose logs postgres`