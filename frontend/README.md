# ExclusiveGrades Frontend

A complete, production-ready React-based frontend for the ExclusiveGrades school result management system.

## Features

### Public Pages
- **Landing Page**: Hero section, features, pricing, testimonials, FAQs
- **School Landing Page**: Public result checker with PIN verification

### Authentication
- User login and registration
- Password reset functionality
- Profile management

### Admin Dashboard
- **Dashboard**: Overview with stats and recent activity
- **Student Management**: Add, edit, delete students with CSV import
- **Teacher Management**: Add, edit, delete teachers with auto-generated credentials
- **Results Management**: Review and approve teacher-submitted results
- **Wallet Management**: Fund wallet with Paystack integration
- **PIN Management**: Generate single and bulk PINs with download option
- **Announcements**: Create and manage school announcements
- **Analytics**: Visual reports and performance insights
- **Settings**: School information and subscription management

### Teacher Dashboard
- **Dashboard**: Overview of uploaded results
- **Results Upload**: CSV and grid-based result entry
- **Profile Management**: Update profile and change password

### Responsive Design
- Mobile-first responsive layout
- Works seamlessly on desktop, tablet, and mobile devices
- Dark mode support ready

## Tech Stack

- **React 18.2**: UI framework
- **React Router v6**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server
- **Lucide Icons**: Beautiful icon library
- **Recharts**: Data visualization
- **Axios**: HTTP client

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
VITE_API_BASE_URL=http://localhost/exclusivegrade/backend/api
```

3. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   ├── Card.jsx
│   ├── Alert.jsx
│   ├── Pagination.jsx
│   └── ...
├── pages/              # Page components
│   ├── Landing.jsx      # Public landing page
│   ├── SchoolLanding.jsx # School result checker
│   ├── auth/            # Auth pages
│   ├── admin/           # Admin dashboard
│   └── teacher/         # Teacher pages
├── context/            # React context
│   └── AuthContext.jsx
├── hooks/              # Custom React hooks
│   ├── useApi.js
│   └── index.js
├── utils/              # Utility functions
│   └── helpers.js
├── config.js           # Configuration
├── App.jsx             # Main app component
└── index.css           # Global styles
```

## Features in Detail

### Student Management
- Add individual students or bulk import via CSV
- Edit student information (name, admission number, class, sex, DOB)
- Upload student photos
- Search and filter by class
- Deactivate students

### Teacher Management
- Add teachers with auto-generated username and password
- Copy credentials easily
- Edit teacher information
- Manage teacher status

### Results Management
- Teachers upload results via CSV or grid entry
- Admins review complete report cards
- Add principal comments and set next term dates
- Approve and publish or return for revision

### Wallet & Payments
- Display current balance and PIN rates
- Fund wallet with Paystack integration
- View transaction history
- Calculate available PINs based on balance
- Bulk discount information

### PIN Management
- Generate single PINs per student
- Generate bulk PINs for entire class
- Set usage limits (unlimited, 1-time, etc.)
- Copy PIN to clipboard
- Download PIN list as CSV
- Track PIN status (active, used, expired)

### Announcements
- Create, edit, delete announcements
- Set priority (general, important, urgent)
- Search announcements
- Display on dashboard

### Analytics
- Enrollment trends (line chart)
- PIN usage patterns (bar chart)
- Performance distribution by grade
- Summary statistics

## Usage

### Login
- Admin/Super Admin: `/auth/login`
- Default credentials provided in demo box
- Redirects to `/admin` on login

### Register School
- `/auth/register` - Create new school account
- Redirects to admin dashboard on success

### Student Management
1. Go to `/admin/students`
2. Click "Add Student" to add manually
3. Or click "Import CSV" for bulk import
4. Edit or deactivate as needed

### Upload Results (Teacher)
1. Go to `/teacher/results-upload`
2. Choose upload method (CSV or grid)
3. Download template if needed
4. Upload and submit for review

### Review Results (Admin)
1. Go to `/admin/results`
2. Click "Review" on pending results
3. Add comments and set next term date
4. Approve & Publish or Return to Teacher

## API Integration

All API calls are managed through the `useApi` hook:

```javascript
const { get, post, put, del } = useApi()

// Get data
const response = await get('/students')

// Create data
const response = await post('/students', { name: '...' })

// Update data
const response = await put(`/students/${id}`, { name: '...' })

// Delete data
const response = await del(`/students/${id}`)
```

## Environment Variables

Create `.env.local` in the root directory:

```
VITE_API_BASE_URL=http://localhost/exclusivegrade/backend/api
VITE_APP_NAME=ExclusiveGrades
```

## Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## Code Quality

### Linting
```bash
npm run lint
```

### Code Formatting
```bash
npm run format
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with Vite
- Lazy loading of routes
- Optimized images
- CSS minification
- JavaScript minification and tree-shaking

## Security Features

- Protected routes with authentication
- Role-based access control (Admin, Teacher)
- Token-based authentication
- CSRF protection ready
- XSS protection with React's built-in escaping

## Mobile Responsiveness

All pages are fully responsive with:
- Mobile-first design
- Hamburger menu for mobile navigation
- Touch-friendly buttons and inputs
- Optimized images for different screen sizes
- Proper viewport configuration

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Form validation and error messages

## License

MIT License

## Support

For issues, questions, or feature requests, please contact support@exclusivegrade.com
