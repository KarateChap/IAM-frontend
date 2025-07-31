# 🎨 IAM Frontend System

A modern, responsive Identity and Access Management (IAM) frontend application built with React, TypeScript, Vite, and Tailwind CSS. This application provides a comprehensive user interface for managing users, groups, roles, permissions, and system access control.

## 🚀 Features

### 🔐 Authentication & Security

- **JWT Authentication** - Secure token-based authentication
- **Route Protection** - AuthGuard component for protected routes
- **Permission-based UI** - Dynamic UI based on user permissions
- **Auto Token Refresh** - Seamless authentication experience
- **Secure Logout** - Complete session cleanup

### 👥 User Management Interface

- **User Dashboard** - Comprehensive user overview
- **User CRUD Operations** - Create, read, update, delete users
- **Group Management** - Organize and manage user groups
- **Role Assignment** - Assign roles to users and groups
- **Permission Management** - Fine-grained permission control

### 🎨 Modern UI/UX

- **Responsive Design** - Mobile-first responsive layout
- **Professional Design** - Clean, modern interface
- **Amber Minimal Theme** - Beautiful color scheme
- **Interactive Components** - Smooth animations and transitions

### 🛠️ Advanced Features

- **Permission Simulation** - Test user permissions before assignment
- **Advanced Filtering** - Search and filter across all entities
- **Bulk Operations** - Efficient multi-item management
- **Audit Trail Visualization** - System activity monitoring

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and building)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors and React Query
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Development**: ESLint, TypeScript, Hot Module Replacement

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend API server running (see backend README)

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=IAM System
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=true
```

### 3. Development Server

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5176
```

### 4. Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/
│   ├── vite.svg             # App icon
│   └── index.html           # HTML template
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx   # Button component
│   │   │   ├── dialog.tsx   # Dialog component
│   │   │   ├── input.tsx    # Input component
│   │   │   └── ...          # Other UI components
│   │   ├── layout/          # Layout components
│   │   │   ├── Layout.tsx   # Main layout wrapper
│   │   │   ├── Sidebar.tsx  # Navigation sidebar
│   │   │   └── Header.tsx   # App header
│   │   └── guards/          # Route protection
│   │       ├── AuthGuard.tsx      # Authentication guard
│   │       └── PermissionGuard.tsx # Permission guard
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   │   ├── LoginPage.tsx      # Login page
│   │   │   └── RegisterPage.tsx   # Registration page
│   │   ├── dashboard/       # Dashboard pages
│   │   │   ├── DashboardPage.tsx  # Main dashboard
│   │   │   └── SimpleDashboard.tsx # Simple dashboard
│   │   ├── users/           # User management
│   │   │   └── UsersPage.tsx      # Users management page
│   │   ├── groups/          # Group management
│   │   │   └── GroupsPage.tsx     # Groups management page
│   │   ├── roles/           # Role management
│   │   │   └── RolesPage.tsx      # Roles management page
│   │   ├── modules/         # Module management
│   │   │   └── ModulesPage.tsx    # Modules management page
│   │   └── permissions/     # Permission management
│   │       └── PermissionsPage.tsx # Permissions management page
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hooks
│   │   ├── useUsers.ts      # User management hooks
│   │   ├── useGroups.ts     # Group management hooks
│   │   └── ...              # Other custom hooks
│   ├── services/            # API service layer
│   │   ├── api.ts           # Axios configuration
│   │   ├── authService.ts   # Authentication API
│   │   ├── usersService.ts  # Users API
│   │   ├── groupsService.ts # Groups API
│   │   └── ...              # Other API services
│   ├── store/               # Redux store
│   │   ├── index.ts         # Store configuration
│   │   ├── authSlice.ts     # Authentication state
│   │   └── ...              # Other slices
│   ├── types/               # TypeScript type definitions
│   │   ├── index.ts         # Common types
│   │   ├── auth.types.ts    # Authentication types
│   │   └── ...              # Other type definitions
│   ├── utils/               # Utility functions
│   │   ├── permissions.ts   # Permission utilities
│   │   ├── constants.ts     # App constants
│   │   └── ...              # Other utilities
│   ├── styles/              # Global styles
│   │   └── globals.css      # Global CSS with Tailwind
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # App entry point
│   └── vite-env.d.ts        # Vite type definitions
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # Node TypeScript config
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── components.json          # shadcn/ui configuration
├── eslint.config.js         # ESLint configuration
└── README.md                # This file
```

## 🎨 UI Components

### shadcn/ui Integration

The application uses shadcn/ui for consistent, accessible components:

- **Button** - Various button styles and sizes
- **Dialog** - Modal dialogs for forms and confirmations
- **Input** - Form input components with validation
- **Table** - Data tables with sorting and pagination
- **Card** - Content containers
- **Badge** - Status indicators
- **Alert** - Notification components
- **Dropdown** - Menu and select components

### Custom Components

- **Layout** - Main application layout with sidebar
- **AuthGuard** - Route protection based on authentication
- **PermissionGuard** - Route protection based on permissions
- **DataTable** - Enhanced table with filtering and actions
- **FormDialog** - Reusable form modal component

## 🔐 Authentication Flow

### Login Process

1. User enters email and password
2. Frontend sends credentials to backend
3. Backend validates and returns JWT token
4. Token stored in Redux store and localStorage
5. User redirected to dashboard
6. Token attached to all API requests

### Route Protection

```tsx
// Protected route example
<Route
  path="/users"
  element={
    <AuthGuard>
      <PermissionGuard module="Users" action="read">
        <UsersPage />
      </PermissionGuard>
    </AuthGuard>
  }
/>
```

### Permission-based UI

```tsx
// Conditional rendering based on permissions
{
  canCreate(permissions, "Users") && (
    <Button onClick={openCreateDialog}>
      <Plus className="mr-2 h-4 w-4" />
      Add User
    </Button>
  );
}
```

## 🎯 Key Features

### Dashboard

- **System Overview** - Key metrics and statistics
- **Permission Simulation** - Test user permissions
- **Recent Activity** - Latest system activities
- **Quick Actions** - Common administrative tasks

### User Management

- **User List** - Paginated user table with search
- **User Creation** - Form with validation
- **User Editing** - Update user information
- **User Deletion** - Safe user removal
- **Group Assignment** - Assign users to groups

### Group Management

- **Group List** - Manage user groups
- **Role Assignment** - Assign roles to groups
- **User Assignment** - Add/remove users from groups
- **Group Permissions** - View effective permissions

### Role Management

- **Role List** - Manage system roles
- **Permission Assignment** - Assign permissions to roles
- **Role Hierarchy** - Understand role relationships

### Permission System

- **Permission Matrix** - Visual permission overview
- **Module-based Permissions** - Organized by system modules
- **Action-based Control** - Create, Read, Update, Delete permissions
- **Inheritance Visualization** - See how permissions flow

## 🔧 Development

### Code Style

- **TypeScript** - Strict type checking
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting (if configured)
- **Tailwind CSS** - Utility-first CSS framework

### Development Workflow

1. Make changes to source code
2. Vite provides hot module replacement
3. TypeScript provides real-time type checking
4. ESLint provides code quality feedback

### Adding New Features

1. Create types in `src/types/`
2. Add API service in `src/services/`
3. Create custom hooks in `src/hooks/`
4. Build UI components in `src/components/`
5. Create pages in `src/pages/`
6. Add routes in `App.tsx`

### State Management

```tsx
// Redux slice example
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.permissions = action.payload.permissions;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.permissions = [];
    },
  },
});
```

## 🎨 Theming

### Amber Minimal Theme

The application uses a custom amber minimal theme:

- **Primary Color**: Amber (#f2b878)
- **Typography**: Inter, Source Serif 4, JetBrains Mono
- **Shadows**: Professional shadow system
- **Dark Mode**: Complete dark mode support

### Customization

Update `tailwind.config.js` and `src/styles/globals.css` to customize:

```css
:root {
  --primary: 38.7 92% 50.2%; /* Amber primary */
  --primary-foreground: 48 96% 89%;
  /* ... other CSS variables */
}
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features

- **Collapsible Sidebar** - Space-efficient navigation
- **Touch-friendly UI** - Optimized for touch interactions
- **Responsive Tables** - Horizontal scrolling on mobile
- **Mobile-first Design** - Optimized for mobile devices

## 🚀 Production Deployment

### Build Process

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Files will be in dist/ directory
```

### Testing Tools (Future)

- **Vitest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: E2E testing

## 🔧 Configuration

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5176,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

### TypeScript Configuration

- **Strict Mode**: Enabled for type safety
- **Path Mapping**: `@/` alias for src directory
- **JSX**: React JSX transform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure TypeScript compiles without errors
5. Test your changes
6. Submit a pull request

## 📚 Learning Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

---

**Built with ❤️ for modern identity management**
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
