# ExclusiveGrade - School Management Platform

A multivendor school management platform where schools can register, manage students, upload results, and sell PINs for result access.

## Features
- Multi-school system with unique URLs
- Student management (add, edit, CSV import)
- Teacher management with auto-generated credentials
- Customizable result templates (CA1+CA2+Exam or Assignment+CA+Exam)
- Cognitive assessment and attendance tracking
- Two-step result workflow (teacher draft → admin review → publish)
- PIN generation with usage limit
- Wallet system (Paystack + manual bank transfer)
- AI lesson notes (Pro/Enterprise)
- CBT practice module

## Tech Stack
- Frontend: React + Vite
- Backend: PHP 8.1+
- Database: MySQL
- Hosting: cPanel

## Installation
1. Clone repository
2. Copy `.env.example` to `.env` and update credentials
3. Import database schema from `/database/schema.sql`
4. Configure web server to point to `/frontend/dist` for frontend

## Environment Variables
Copy `.env.example` to `.env` and update:
- Database credentials
- Paystack keys
- OpenAI API key (for AI notes)
- SMTP settings (for emails)

## License
MIT