# ExclusiveGrades Frontend — Deployment Guide

## Development

```bash
npm install
npm run dev        # starts at http://localhost:3000
```

## Production Build (cPanel)

### Step 1 — Configure environment
Edit `.env` file:
```
VITE_API_URL=https://your-domain.com/backend/api
VITE_APP_NAME=ExclusiveGrades
VITE_APP_ENV=production
```

### Step 2 — Build
```bash
npm run build
```
Output goes to `dist/` folder.

### Step 3 — Upload to cPanel
Upload the **contents of `dist/`** to your `public_html` (or the subdirectory you want):
```
public_html/
  index.html
  logo.png
  assets/
    vendor-xxx.js
    index-xxx.js
    ...
```

### Step 4 — Configure .htaccess for React Router
Create `public_html/.htaccess`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QL]
```

### Backend API
Your backend PHP files stay in `backend/api/`.
Update `VITE_API_URL` to point to the correct public URL.

## Route Overview
| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Admin/Teacher login |
| `/register` | School registration |
| `/school/:slug` | Public school page + result checker |
| `/admin/*` | School Admin dashboard |
| `/teacher/*` | Teacher dashboard |
| `/super/*` | Super Admin dashboard |

## Local Storage Keys
| Key | Value |
|---|---|
| `gg_token` | JWT bearer token |
| `gg_user` | Authenticated user object |
| `gg_school` | School data |
