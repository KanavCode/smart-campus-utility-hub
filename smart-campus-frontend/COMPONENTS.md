# 📚 Component Library Documentation

## UI Components (`src/components/ui/`)

### Button Component

**Location:** `src/components/ui/Button.jsx`

**Usage:**

```jsx
import Button from './components/ui/Button';
import { ArrowRight } from 'lucide-react';

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

<Button
  variant="outline"
  leftIcon={<ArrowRight />}
  isLoading={loading}
>
  Submit
</Button>
```

**Props:**

- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean - Shows spinner
- `disabled`: boolean
- `leftIcon`: ReactNode - Icon on the left
- `rightIcon`: ReactNode - Icon on the right
- `fullWidth`: boolean - Makes button 100% width
- `onClick`: Function
- `type`: 'button' | 'submit' | 'reset'

**Animations:**

- Hover: Scales up to 1.05
- Tap: Scales down to 0.95
- Loading: Rotating spinner

---

### Card Component

**Location:** `src/components/ui/Card.jsx`

**Usage:**

```jsx
import Card, { CardHeader, CardBody, CardFooter } from "./components/ui/Card";

<Card glass hover>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

**Props:**

- `glass`: boolean - Applies glassmorphism effect
- `hover`: boolean - Enables hover animation (default: true)
- `onClick`: Function
- `className`: string - Additional CSS classes

**Sub-components:**

- `CardHeader` - Top section with border
- `CardBody` - Main content area
- `CardFooter` - Bottom section with border

**Animations:**

- Hover: Lifts up (-4px) with shadow

---

### Input Component

**Location:** `src/components/ui/Input.jsx`

**Usage:**

```jsx
import Input from "./components/ui/Input";
import { Mail } from "lucide-react";

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  leftIcon={<Mail />}
  error={errors.email?.message}
  helperText="We'll never share your email"
/>;
```

**Props:**

- `label`: string - Input label text
- `error`: string - Error message (displays in red)
- `leftIcon`: ReactNode - Icon on the left
- `rightIcon`: ReactNode - Icon on the right
- `helperText`: string - Helper text below input
- `type`: string - Input type (default: 'text')
- All standard HTML input attributes

**Features:**

- Automatic error styling
- Icon support
- Helper text
- Focus ring animations

---

### Modal Component

**Location:** `src/components/ui/Modal.jsx`

**Usage:**

```jsx
import Modal, { ModalBody, ModalFooter } from "./components/ui/Modal";

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <ModalBody>
    <p>Are you sure you want to continue?</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Confirm
    </Button>
  </ModalFooter>
</Modal>;
```

**Props:**

- `isOpen`: boolean (required) - Controls visibility
- `onClose`: Function (required) - Close handler
- `title`: string - Modal title
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
- `showCloseButton`: boolean (default: true)
- `closeOnBackdrop`: boolean (default: true)
- `closeOnEsc`: boolean (default: true)

**Features:**

- Backdrop blur
- Escape key to close
- Click outside to close
- Prevents body scroll when open
- Smooth animations (fade + scale)
- Accessible (ARIA labels, focus management)

---

### SkeletonLoader Component

**Location:** `src/components/ui/SkeletonLoader.jsx`

**Usage:**

```jsx
import SkeletonLoader, {
  SkeletonCard,
  SkeletonEventCard,
  SkeletonProfile,
  SkeletonTable
} from './components/ui/SkeletonLoader';

// Basic skeleton
<SkeletonLoader variant="rectangular" width="100%" height="200px" />

// Multiple skeletons
<SkeletonLoader variant="text" count={3} />

// Pre-built skeletons
<SkeletonCard />
<SkeletonEventCard />
<SkeletonProfile />
<SkeletonTable rows={5} columns={4} />
```

**Props:**

- `variant`: 'text' | 'rectangular' | 'circular' | 'card' (default: 'rectangular')
- `width`: string - Custom width
- `height`: string - Custom height
- `count`: number - Number of skeletons to render (default: 1)

**Pre-built Skeletons:**

- `SkeletonCard` - Generic card skeleton
- `SkeletonEventCard` - Event card skeleton
- `SkeletonProfile` - User profile skeleton
- `SkeletonTable` - Table skeleton

**Animations:**

- Pulse animation (shimmer effect)

---

### ThemeToggle Component

**Location:** `src/components/ui/ThemeToggle.jsx`

**Usage:**

```jsx
import ThemeToggle from "./components/ui/ThemeToggle";

<ThemeToggle />;
```

**Features:**

- Animated sun/moon icon swap
- Smooth rotation transition
- Hover and tap animations
- Automatically syncs with ThemeContext
- Keyboard accessible

**No props required** - Connects to ThemeContext automatically

---

## Layout Components (`src/components/layout/`)

### Navbar Component

**Location:** `src/components/layout/Navbar.jsx`

**Features:**

- Responsive design (mobile hamburger menu)
- Theme toggle integrated
- User authentication state
- User dropdown menu
- Mobile menu with animations
- Active route highlighting

**Automatic behaviors:**

- Shows/hides links based on authentication
- Displays user avatar when logged in
- Mobile menu on screens < 768px
- Dropdown menu for user options

---

### Footer Component

**Location:** `src/components/layout/Footer.jsx`

**Features:**

- Multi-column layout
- Social media links
- Product and company links
- Responsive design
- Auto-updates year

**No props required** - Static component

---

## Context & Hooks

### ThemeContext

**Location:** `src/context/ThemeContext.jsx`

**Usage:**

```jsx
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// Wrap app
<ThemeProvider>
  <App />
</ThemeProvider>;

// In components
function MyComponent() {
  const { theme, toggleTheme, isDark, isLight } = useTheme();

  return <button onClick={toggleTheme}>Current theme: {theme}</button>;
}
```

**API:**

- `theme`: 'light' | 'dark'
- `toggleTheme()`: Function to toggle theme
- `setThemeMode(theme)`: Set specific theme
- `isDark`: boolean
- `isLight`: boolean

**Features:**

- Persists to localStorage
- Applies CSS class to document root
- Smooth transitions

---

### useAuthStore

**Location:** `src/hooks/useAuthStore.js`

**Usage:**

```jsx
import useAuthStore from "./hooks/useAuthStore";

function MyComponent() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  return (
    <div>
      {isAuthenticated ? <p>Welcome, {user.name}!</p> : <p>Please log in</p>}
    </div>
  );
}
```

**API:**

- `user`: User object or null
- `token`: JWT token or null
- `isAuthenticated`: boolean
- `isLoading`: boolean
- `setAuth(userData, token)`: Set auth state
- `setUser(userData)`: Update user only
- `clearAuth()`: Clear auth state
- `setLoading(boolean)`: Set loading state

**Features:**

- Zustand-based (no provider needed)
- Persists to localStorage
- Global state management

---

## Utilities

### Animations

**Location:** `src/utils/animations.js`

**Common variants:**

```jsx
import {
  pageTransition,
  fadeInUp,
  cardHover,
  staggerContainer,
  staggerItem,
  modalBackdrop
} from './utils/animations';

<motion.div
  variants={pageTransition}
  initial="initial"
  animate="animate"
  exit="exit"
>
  Page content
</motion.div>

<motion.div variants={staggerContainer} initial="hidden" animate="show">
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

**Available variants:**

- `pageTransition` - Page enter/exit
- `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- `scaleIn` - Scale animation
- `cardHover`, `cardHoverSubtle` - Card hover effects
- `staggerContainer`, `staggerItem` - Staggered lists
- `buttonHoverTap`, `buttonTap` - Button interactions
- `modalBackdrop`, `modalContent` - Modal animations
- `sidebarVariants` - Sidebar open/close
- `floatAnimation`, `pulseAnimation`, `rotateAnimation`
- `slideInLeft`, `slideInRight`
- `shakeAnimation` - Error shake

---

### API Services

**Location:** `src/lib/api.js`

**Usage:**

```jsx
import { authService, eventService, electiveService } from "./lib/api";

// Authentication
const { user, token } = await authService.login({ email, password });
await authService.register({ name, email, password, role });
const profile = await authService.getProfile();

// Events
const events = await eventService.getEvents({ category: "workshop" });
const event = await eventService.getEventById(id);
await eventService.saveEvent(eventId);

// Electives
const electives = await electiveService.getElectives();
await electiveService.submitChoices({ preferences: [id1, id2, id3] });
```

**Services:**

- `authService` - Authentication endpoints
- `eventService` - Events & saved events
- `clubService` - Campus clubs
- `electiveService` - Elective selection
- `timetableService` - Timetable viewing

**Features:**

- Automatic token injection
- Error handling with toast notifications
- 401 handling (auto-logout)
- Request/response interceptors

---

## Custom CSS Classes

### Glassmorphism

```jsx
<div className="glass">Glassmorphism effect</div>
<div className="glass-strong">Stronger glass effect</div>
```

### Gradient Text

```jsx
<h1 className="gradient-text">Gradient text</h1>
<span className="text-gradient-purple-teal">Purple to teal</span>
```

### Premium Card

```jsx
<div className="premium-card p-6">Premium styled card</div>
```

### Buttons

```jsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-outline">Outline</button>
<button className="btn-ghost">Ghost</button>
```

### Input Fields

```jsx
<input className="input-field" placeholder="Enter text" />
```

### Scrollbar

```jsx
<div className="custom-scrollbar overflow-auto">
  Scrollable content with custom scrollbar
</div>
```

### Skeleton

```jsx
<div className="skeleton h-4 w-full"></div>
```

---

## Color Palette

### Light Mode

- Background: `#FFFFFF`
- Background Alt: `#F9F8FF`
- Text Primary: `#010D2C`
- Text Secondary: `#5E6475`

### Dark Mode

- Background: `#010D2C`
- Background Alt: `#0A1435`
- Text Primary: `#F9F8FF`
- Text Secondary: `#A0AEC0`

### Accent Colors

- Primary: `#7950F2` (Purple)
- Accent: `#14B8A6` (Teal)
- Success: `#10B981`
- Error: `#EF4444`
- Warning: `#F59E0B`
- Info: `#3B82F6`

---

## Typography

### Fonts

- **Headings:** Lexend (font-display)
- **Body:** Inter (font-sans)

### Usage

```jsx
<h1 className="font-display font-bold text-4xl">Heading</h1>
<p className="font-sans text-base">Body text</p>
```

---

## Responsive Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Usage:**

```jsx
<div className="w-full md:w-1/2 lg:w-1/3">Responsive width</div>
```

---

This component library provides a solid foundation for building the rest of the Smart Campus application!
