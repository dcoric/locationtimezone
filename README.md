# Location Timezone API

A Node.js Express application that provides IP geolocation and timezone information using the `geoip-lite` library. This service exposes REST endpoints to get location data based on IP addresses.

## Features

- IP geolocation lookup
- Timezone information retrieval
- CORS support for cross-origin requests
- Docker containerization
- PM2 ecosystem configuration for production deployment
- ESLint configuration for code quality

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker (optional, for containerized deployment)
- PM2 (optional, for production deployment)

## Installation

### Local Development

1. Clone the repository:
   ```bash
   git clone git@github.com:dcoric/locationtimezone.git
   cd locationtimezone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Using Yarn (alternative)

```bash
yarn install
```

## Running the Application

### Development Mode

Start the application with automatic reload on file changes:

```bash
npm run start:dev
```

### Production Mode

Start the application normally:

```bash
npm start
```

The server will start on port 7755 by default (or the port specified in the `PORT` environment variable).

### Using PM2 (Production)

For production deployment with process management:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# View logs
pm2 logs location-timezone

# Monitor the application
pm2 monit

# Stop the application
pm2 stop location-timezone

# Restart the application
pm2 restart location-timezone
```

### Using Docker

#### Build and run locally:

```bash
# Build the Docker image
docker build -t locationtimezone .

# Run the container
docker run -p 7755:7755 locationtimezone
```

#### Using Docker Compose:

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## API Endpoints

The application exposes REST endpoints for IP geolocation. Check the source code in `src/routes/` for specific endpoint documentation.

### Example Usage

```bash
# Example API call (replace with actual endpoint)
curl http://localhost:7755/api/location/8.8.8.8
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3030, production default: 7755)
- `API_URL`: API URL for Docker builds

### Configuration Files

- `ecosystem.config.js`: PM2 process management configuration
- `docker-compose.yml`: Docker Compose service configuration
- `Dockerfile`: Docker container build configuration

## Development

### Code Quality

Run ESLint to check code quality:

```bash
npx eslint .
```

### Project Structure

```
├── src/
│   ├── app.js                 # Main application file
│   ├── ip-processing.js       # IP processing logic
│   ├── routes/               # API routes
│   └── helper/               # Helper utilities
├── index.js                  # Application entry point
├── package.json              # Dependencies and scripts
├── ecosystem.config.js       # PM2 configuration
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile               # Docker build configuration
└── PLAN.md                  # Project improvement plan
```

## Updating Dependencies

### Check for outdated packages:

```bash
npm outdated
```

### Update packages:

```bash
# Update all dependencies
npm update

# Update specific package
npm install package-name@latest

# Update devDependencies
npm install --save-dev package-name@latest
```

### Security updates:

```bash
# Audit for security vulnerabilities
npm audit

# Fix security issues automatically
npm audit fix

# Force fix (use with caution)
npm audit fix --force
```

### Using Yarn for updates:

```bash
# Check outdated packages
yarn outdated

# Update all dependencies
yarn upgrade

# Update specific package
yarn upgrade package-name@latest

# Security audit
yarn audit

# Fix security issues
yarn audit fix
```

## Deployment

### Production Checklist

Before deploying to production:

1. Run security audit: `npm audit`
2. Check code quality: `npx eslint .`
3. Test the application locally
4. Update environment variables
5. Consider implementing the improvements outlined in `PLAN.md`

### Docker Production Deployment

```bash
# Build production image
docker build -t locationtimezone:latest .

# Run with production settings
docker run -d \
  --name locationtimezone-prod \
  -p 7755:7755 \
  -e PORT=7755 \
  --restart unless-stopped \
  locationtimezone:latest
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT environment variable or kill the process using the port
2. **Docker build fails**: Check Node.js version compatibility (current Dockerfile uses Node 12, consider updating to Node 18+)
3. **npm install errors**: Clear npm cache with `npm cache clean --force`

### Logs

- Development: Check console output
- PM2: `pm2 logs location-timezone`
- Docker: `docker logs <container-id>` or `docker-compose logs`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Future Improvements

See `PLAN.md` for a comprehensive improvement roadmap including:

- Security enhancements (input validation, rate limiting, security headers)
- Code quality improvements (TypeScript migration, modern JavaScript)
- API improvements (documentation, standardization)
- Performance optimizations (caching, logging)
- Testing implementation
- CI/CD pipeline setup

## License

ISC

## Author

Denis Coric

## Repository

[GitHub Repository](https://github.com/dcoric/locationtimezone)