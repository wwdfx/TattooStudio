# V.SHAI TATTOO - Tattoo Management System

A complete tattoo studio management system with client-facing features and administrative capabilities.

## Overview

This web application provides:

- Public website for clients to browse tattoo artists and their work
- Online booking system for appointments
- Portfolio showcase with filtering options
- Admin dashboard for managing appointments, clients, artists, and portfolio items
- Authentication system for clients and administrators

## Setup Instructions

Follow these steps to get the application fully functional:

### 1. Supabase Setup

The application uses Supabase as the backend database. You need to set up the necessary database functions:

1. Log in to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project (or create a new one)
3. Go to the SQL Editor
4. Copy the contents of the `supabase-setup.sql` file
5. Paste it into the SQL Editor and run the script
6. This will create all the necessary functions for database initialization

### 2. Initialize the Database

After setting up the Supabase functions, you need to initialize the database:

1. Open the application in your browser
2. Navigate to the setup page: `/setup.html`
3. Make sure the connection status shows "Connected to Supabase successfully!"
4. Check the "Include sample data" checkbox (recommended for testing)
5. Click the "Initialize Database" button
6. Wait for the initialization to complete (you'll see progress in the log)
7. Verify that all tables show "Created" status

### 3. Admin Access

To access the admin dashboard:

1. After database initialization, an admin user is created with:
   - Email: `admin@vshai.tattoo`
   - Password: `admin123` (change this after first login)
2. Click the "Login" button in the top navigation
3. Enter the admin credentials
4. You'll be redirected to the admin dashboard

### 4. Deployment

To deploy the application to Render:

1. Create an account on [Render](https://render.com/)
2. Click "New" and select "Static Site"
3. Connect your GitHub repository or upload the files directly
4. Configure the deployment settings:
   - Name: Choose a name for your site
   - Build Command: Leave blank (no build step needed)
   - Publish Directory: `.` (the root directory)
5. Click "Create Static Site"
6. Once deployed, your site will be available at a URL like `https://your-site-name.onrender.com`

### 5. Custom Domain (Optional)

To use your own domain:

1. Go to your static site settings in Render
2. Click on "Custom Domain"
3. Follow the instructions to add and verify your domain
4. Update your domain's DNS settings as instructed by Render

## Project Structure

- `index.html` - Home page
- `portfolio.html` - Portfolio showcase
- `booking.html` - Appointment booking system
- `setup.html` - Database setup page
- `admin/` - Admin dashboard files
- `css/` - Stylesheets
- `js/` - JavaScript files
- `images/` - Image assets

## JavaScript Files

- `supabase-config.js` - Supabase configuration and utility functions
- `auth.js` - Authentication functionality
- `main.js` - Main website functionality
- `portfolio.js` - Portfolio page functionality
- `booking.js` - Booking system functionality
- `admin.js` - Admin dashboard functionality
- `db-setup.js` - Database initialization script

## Troubleshooting

### Database Connection Issues

If you encounter issues connecting to Supabase:

1. Check that the Supabase URL and anon key in `js/supabase-config.js` are correct
2. Verify that your Supabase project is active
3. Check the browser console for any error messages

### Initialize Database Button Not Working

If the Initialize Database button doesn't work:

1. Check the browser console for JavaScript errors
2. Verify that the SQL functions were created successfully in Supabase
3. Make sure the Supabase client is initialized correctly in `js/supabase-config.js`

### Authentication Issues

If you can't log in:

1. Clear browser cookies and try again
2. Verify that the admin user was created during database initialization
3. Check the browser console for any authentication errors

## Credits

- Images: [Unsplash](https://unsplash.com/)
- Icons: [Font Awesome](https://fontawesome.com/)
- Database: [Supabase](https://supabase.io/)
