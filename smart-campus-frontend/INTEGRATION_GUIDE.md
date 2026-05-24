# Smart Campus Hub - Frontend Integration Guide

## 🎨 Design System

This application replicates the **Chargeflow.io** design language with:
- **Glassmorphism**: All cards, navbars, and floating elements
- **Lime Green Primary Color**: #B5FF00 (HSL: 84 100% 50%)
- **Blue Accent Color**: Used for hover states and secondary actions
- **Glow Effects**: On all interactive elements
- **Framer Motion**: Smooth animations throughout
- **Dark Theme Default**: With light theme support

### Color Tokens (defined in `src/index.css`)
```css
--primary: 84 100% 50%;        /* Lime Green */
--primary-foreground: 0 0% 0%; /* Black text on lime */
--accent: 249 90% 60%;          /* Blue */
--background: 240 10% 4%;       /* Dark background */
```

### Utility Classes
- `.glass` - Glassmorphism effect
- `.glow-primary` - Primary glow
- `.glow-accent` - Accent glow
- `.glow-primary-hover` - Glow on hover
- `.glow-accent-hover` - Accent glow on hover

## 🗂️ Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Public navigation
│   │   ├── Sidebar.tsx         # Dashboard sidebar (icon-only, expands on hover)
│   │   ├── Header.tsx          # Dashboard header with user menu
│   │   └── DashboardLayout.tsx # Wrapper for authenticated pages
│   ├── ui/                     # shadcn components
│   ├── ThemeToggle.tsx         # Sun/Moon theme switcher
│   └── ProtectedRoute.tsx      # Route authentication wrapper
├── contexts/
│   ├── ThemeContext.tsx        # Theme state management
│   └── AuthContext.tsx         # Authentication state
├── pages/
│   ├── Landing.tsx             # Public landing page
│   ├── Auth.tsx                # Login/Signup
│   ├── student/
│   │   ├── Dashboard.tsx
│   │   ├── Timetable.tsx
│   │   └── Electives.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── Users.tsx
│       ├── Events.tsx
│       ├── AdminElectives.tsx
│       ├── Timetable.tsx
│       ├── Subjects.tsx
│       └── Settings.tsx
├── lib/
│   └── axios.ts                # Configured axios instance
└── App.tsx                     # Routes & providers
```

## 🔌 Backend Integration Points

### 1. API Configuration
Edit `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
# Optional override for auth/SSO + websocket base URL
# VITE_AUTH_BASE_URL=http://localhost:5000
```

The axios instance is configured in `src/lib/axios.ts` with automatic token injection.

### 2. Authentication Flow

#### Login (`src/contexts/AuthContext.tsx` - line 30)
```typescript
const login = async (email: string, password: string) => {
  // TODO: Replace with:
  // const response = await api.post('/auth/login', { email, password });
  // setUser(response.data.user);
  // localStorage.setItem('token', response.data.token);
}
```

#### Signup (`src/contexts/AuthContext.tsx` - line 48)
```typescript
const signup = async (name: string, email: string, password: string) => {
  // TODO: Replace with:
  // const response = await api.post('/auth/signup', { name, email, password });
  // setUser(response.data.user);
  // localStorage.setItem('token', response.data.token);
}
```

### 3. Student Pages

#### Dashboard (`src/pages/student/Dashboard.tsx`)
- **Data needed**: Today's schedule, upcoming events, elective status
- **Props to add**: `scheduleData`, `eventsData`, `electiveStatus`

#### Timetable (`src/pages/student/Timetable.tsx` - line 14)
```typescript
// Current: const timetableData: Record<string, Record<number, TimetableSlot>> = {};
// TODO: Fetch from API
// useEffect(() => {
//   api.get('/timetable/student').then(res => setTimetableData(res.data));
// }, []);
```

**Expected API Response:**
```json
{
  "Monday": {
    "1": { "subject": "Data Structures", "teacher": "Dr. Smith", "room": "CS-101", "isLab": false },
    "2": { "subject": "DSA Lab", "teacher": "Prof. Johnson", "room": "LAB-3", "isLab": true }
  }
}
```

#### Electives (`src/pages/student/Electives.tsx` - line 13)
```typescript
// Current: const availableElectives: Elective[] = [];
// TODO: Fetch from API
// useEffect(() => {
//   api.get('/electives/available').then(res => setAvailableElectives(res.data));
// }, []);
```

**Submit Preferences** (line 19):
```typescript
const handleSubmit = async () => {
  // TODO: Replace with:
  // await api.post('/electives/submit', { preferences });
}
```

### 4. Admin Pages

All admin management pages follow the same pattern:

#### Generic CRUD Operations
```typescript
// CREATE
const handleCreate = async () => {
  // Open modal, collect form data
  // await api.post('/[resource]', formData);
}

// READ (in useEffect)
// const { data } = await api.get('/[resource]');
// setItems(data);

// UPDATE
const handleEdit = async (id: string) => {
  // Fetch: await api.get(`/[resource]/${id}`);
  // Open modal with data
  // Submit: await api.put(`/[resource]/${id}`, formData);
}

// DELETE
const handleDelete = async (id: string) => {
  // await api.delete(`/[resource]/${id}`);
}
```

#### Elective Allocation (`src/pages/admin/AdminElectives.tsx` - line 17)
```typescript
const handleRunAllocation = async () => {
  // TODO: Replace with:
  // const response = await api.post('/electives/allocate');
  // Show results to admin
}
```

#### Timetable Generation (`src/pages/admin/Timetable.tsx`)
```typescript
const handleGenerateDraft = async () => {
  // TODO: await api.post('/timetable/generate');
}

const handleConfirmPublish = async () => {
  // TODO: await api.post('/timetable/publish');
}
```

## 🎭 Component Props Structure

### TimetableSlot Interface
```typescript
interface TimetableSlot {
  subject?: string;
  teacher?: string;
  room?: string;
  isLab?: boolean;  // Shows beaker icon
}
```

### User Interface
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
}
```

### Elective Interface
```typescript
interface Elective {
  id: string;
  code: string;        // e.g., "CS401"
  name: string;        // e.g., "Machine Learning"
  description: string;
}
```

## 🔐 Authentication Flow

1. User logs in via `/auth`
2. Backend returns JWT token and user object
3. Token stored in localStorage
4. Axios interceptor adds token to all requests
5. Protected routes check `isAuthenticated` from AuthContext
6. Admin routes also check `user.role === 'admin'`

## 🎨 Theme System

- Default: Dark theme
- Toggle: Sun/Moon icon in user dropdown
- Persistence: Saved to localStorage
- Implementation: Tailwind's `dark:` variant
- Access: `useTheme()` hook

## 🚀 Running the Application

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📝 Key Integration Notes

1. **No Mock Data**: All arrays are initialized empty. Fill them with API data.
2. **Placeholder Functions**: Every action has an empty async function ready for your API calls.
3. **Error Handling**: Add try-catch blocks and use `toast.error()` for user feedback.
4. **Loading States**: Add loading states to buttons and tables as needed.
5. **Validation**: Add form validation before API calls.
6. **Modals**: Create modal components for Create/Edit forms (use shadcn Dialog component).

## 🎯 Priority Integration Tasks

1. ✅ Set up your backend API URL in `.env`
2. ✅ Implement authentication endpoints in `AuthContext.tsx`
3. ✅ Fetch timetable data in student pages
4. ✅ Fetch electives and implement submission
5. ✅ Implement admin CRUD operations
6. ✅ Add Create/Edit modal components
7. ✅ Implement critical actions (allocation, timetable generation)
8. ✅ Add proper error handling and loading states

## 🎨 Adding New Pages

1. Create component in `src/pages/[role]/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/layout/Sidebar.tsx`
4. Wrap with `<ProtectedRoute>` and optional `adminOnly` prop

## 📦 Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **HTTP Client**: Axios
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form (optional - not yet added)
- **State**: React Context API
- **Routing**: React Router v6

---

**Need Help?** Check the TODO comments in each file for specific integration points.
