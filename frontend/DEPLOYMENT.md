/**
 * ExclusiveGrades Frontend - Deployment Guide
 * 
 * This guide covers deployment to various platforms
 */

## Deployment Options

### 1. Apache/XAMPP (Local Development)
- Already configured in your local environment
- Access via: http://localhost/exclusivegrade/frontend
- For production, build the app first: `npm run build`

### 2. Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### 4. GitHub Pages

```bash
# Update vite.config.js:
# base: '/exclusivegrade/'

npm run build
# Push dist folder to gh-pages branch
```

### 5. Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t exclusivegrade-frontend .
docker run -p 80:80 exclusivegrade-frontend
```

### 6. AWS S3 + CloudFront

```bash
# Build
npm run build

# Configure AWS CLI
aws configure

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Environment Setup

### Production Environment Variables

Create `.env.production`:
```
VITE_API_BASE_URL=https://api.exclusivegrade.com/api
VITE_APP_NAME=ExclusiveGrades
```

### Build Optimization

```bash
npm run build
# Output will be in dist/ folder
```

## Performance Checklist

- ✓ CSS is minified
- ✓ JavaScript is minified and tree-shaken
- ✓ Code is split into chunks
- ✓ Images are optimized
- ✓ Fonts are loaded efficiently
- ✓ GZIP compression enabled
- ✓ Caching headers configured
- ✓ CDN configured for static assets

## Security Checklist

- ✓ HTTPS enabled
- ✓ CORS configured correctly
- ✓ CSP headers set
- ✓ XSS protection enabled
- ✓ CSRF tokens implemented
- ✓ Authentication tokens secure
- ✓ API rate limiting enabled
- ✓ Input validation on frontend

## Monitoring

### Application Performance Monitoring
- Google Analytics
- Sentry for error tracking
- Web Vitals monitoring

### Infrastructure Monitoring
- Server uptime monitoring
- API health checks
- Database performance
- Disk space alerts
