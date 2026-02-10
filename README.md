# Polyhub

A comprehensive web application for polytechnic college management built with Node.js, Express, and MongoDB.

## 📋 Features

- **User Portal**: Student and staff information management
- **Admin Dashboard**: Administrative controls and management
- **Photo Gallery**: Image upload and gallery management
- **Question Papers**: Question paper repository and management
- **Forms**: Digital form submission and processing
- **Notifications**: System-wide notification management

## 🚀 Technology Stack

- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Template Engine**: Handlebars (HBS)
- **Authentication**: Session-based with bcrypt password hashing
- **File Upload**: Express-fileupload middleware

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Polyhub-master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file and update the following:
   - `MONGODB_URI`: Your MongoDB connection string
   - `SESSION_SECRET`: A strong, unique secret key (generate using the command in .env.example)
   - `PORT`: Server port (default: 3000)

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For Windows (if MongoDB is installed as a service)
   net start MongoDB
   
   # For macOS/Linux
   sudo systemctl start mongod
   ```

5. **Run the application**
   
   **Development mode** (with auto-restart):
   ```bash
   npm run dev
   ```
   
   **Production mode**:
   ```bash
   npm start
   ```

6. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
Polyhub-master/
├── bin/                 # Application startup scripts
├── config/              # Database and configuration files
│   ├── collections.js   # MongoDB collection definitions
│   └── connection.js    # Database connection setup
├── helpers/             # Business logic and helper functions
│   ├── admin-helper.js
│   ├── staff_helpers.js
│   ├── form_helper.js
│   ├── photoGallery_helper.js
│   ├── questionPaper_helpers.js
│   └── notificationHelper.js
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   ├── img/            # Images
│   ├── docs/           # Document files
│   ├── forms/          # Form files
│   └── questions/      # Question paper files
├── routes/              # Route handlers
│   ├── index.js        # User routes
│   └── admin.js        # Admin routes
├── views/               # Handlebars templates
│   ├── admin/          # Admin views
│   ├── user/           # User views
│   ├── partials/       # Reusable template partials
│   └── layouts/        # Page layouts
├── app.js               # Express application setup
├── package.json         # Project dependencies
└── .env.example         # Environment variables template
```

## 🔧 Configuration

### Session Configuration

The application uses express-session with the following default settings:
- Session timeout: 10 minutes (600000 ms)
- Secret key: Configured via `SESSION_SECRET` environment variable

### File Upload

File uploads are configured using express-fileupload middleware. Uploaded files are stored in the `public/` directory.

## 🛠️ Development

### Available Scripts

- `npm start` - Start the application in production mode
- `npm run dev` - Start the application in development mode with nodemon (auto-restart on file changes)

### Adding New Routes

1. Create route handlers in `routes/` directory
2. Register routes in `app.js`
3. Create corresponding views in `views/` directory

### Adding New Helpers

1. Create helper files in `helpers/` directory
2. Export helper functions and import them in route handlers

## 🔒 Security Notes

- **Never commit `.env` file** to version control
- Always use strong session secrets in production
- Passwords are hashed using bcrypt before storage
- Session cookies are configured with appropriate security settings

## 📝 License

This project is private and proprietary.

## 👥 Contributors

Add your team members and contributors here.

## 🐛 Issues and Support

For issues and support, please contact the development team.

---

**Note**: This is an educational project for polytechnic college management. Ensure proper security measures are implemented before deploying to production.
