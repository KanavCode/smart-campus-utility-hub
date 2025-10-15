# 🎓 Smart Campus Utility Hub - Frontend

<div align="center">

![Phase 1 Complete](https://img.shields.io/badge/Phase_1-Complete-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7+-646CFF?style=for-the-badge&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4+-38B2AC?style=for-the-badge&logo=tailwind-css)

**A premium, animated, accessible campus management platform**

[Quick Start](#-quick-start) •
[Features](#-features) •
[Documentation](#-documentation) •
[Testing](#-testing)

</div>

---

## 🚀 Quick Start

```bash
# Navigate to frontend directory
cd m:\smarthub\smart-campus-utility-hub\smart-campus-frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Open browser to:
# http://localhost:5173
```

**That's it!** The app should be running with hot-reload enabled.

---

## ✨ Features

### Phase 1 - Complete ✅

- 🎨 **Premium UI/UX** - Inspired by modern SaaS applications
- 🌓 **Light/Dark Themes** - Smooth theme switching with persistence
- 📱 **Fully Responsive** - Mobile-first design
- 🎭 **Smooth Animations** - Framer Motion powered transitions
- ♿ **Accessible** - WCAG AA compliant, keyboard navigation
- 🧩 **Component Library** - 7+ reusable UI components
- 🎯 **Type-Safe Routing** - React Router v6+ with protected routes
- 💾 **State Management** - Zustand + React Query
- 🔌 **API Ready** - Axios with interceptors
- 📦 **Modular Architecture** - Clean, scalable code structure

### Coming in Phase 2 🔜

- 🔐 Complete authentication system
- 📋 React Hook Form + Zod validation
- 🎬 Lottie animations
- 📊 Enhanced landing page
- 👤 User dashboard

---

## 🛠️ Tech Stack

| Category             | Technology                   |
| -------------------- | ---------------------------- |
| **Framework**        | React 18+                    |
| **Build Tool**       | Vite 7+                      |
| **Styling**          | Tailwind CSS 4.x             |
| **Routing**          | React Router DOM v6+         |
| **Animations**       | Framer Motion, GSAP, AOS     |
| **Data Fetching**    | React Query (TanStack Query) |
| **State Management** | Zustand                      |
| **Forms**            | React Hook Form + Zod        |
| **HTTP Client**      | Axios                        |
| **Icons**            | Lucide React                 |
| **Notifications**    | React Hot Toast              |
| **Charts**           | Recharts                     |
| **Drag & Drop**      | DnD Kit                      |
| **Date Handling**    | date-fns                     |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── SkeletonLoader.jsx
│   │   └── ThemeToggle.jsx
│   ├── layout/          # Layout components
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   └── features/        # Feature-specific components
├── context/
│   └── ThemeContext.jsx # Theme management
├── hooks/
│   └── useAuthStore.js  # Auth state (Zustand)
├── lib/
│   └── api.js           # API client & services
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   └── RegisterPage.jsx
├── utils/
│   └── animations.js    # Framer Motion variants
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

---

## 📚 Documentation

| Document                                       | Description                           |
| ---------------------------------------------- | ------------------------------------- |
| [QUICKSTART.md](./QUICKSTART.md)               | Get started in 2 minutes              |
| [PHASE1_COMPLETE.md](./PHASE1_COMPLETE.md)     | Full Phase 1 overview & testing guide |
| [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) | Visual testing checklist              |
| [COMPONENTS.md](./COMPONENTS.md)               | Complete component API docs           |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)     | Common issues & solutions             |
| [SUMMARY.md](./SUMMARY.md)                     | Phase 1 achievements summary          |

---

## 🧪 Testing

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

---

## 🎯 Testing Checklist

Visit [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for the complete visual testing guide.

**Quick checks:**

- [ ] Landing page loads correctly
- [ ] Theme toggle works (light ↔ dark)
- [ ] Navigation is responsive
- [ ] Mobile menu works (<768px)
- [ ] Hover effects on buttons/cards
- [ ] All routes redirect correctly
- [ ] No console errors
- [ ] Smooth animations

---

## 🎨 Design System

### Colors

```css
/* Primary */
--primary: #7950F2      /* Purple */
--accent: #14B8A6       /* Teal */

/* Light Theme */
--bg-light: #FFFFFF
--text-light: #010D2C

/* Dark Theme */
--bg-dark: #010D2C
--text-dark: #F9F8FF
```

### Typography

- **Headings:** Lexend (font-display)
- **Body:** Inter (font-sans)

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🧩 Component Usage

### Button

```jsx
import Button from "./components/ui/Button";

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>;
```

### Card

```jsx
import Card, { CardBody } from "./components/ui/Card";

<Card glass hover>
  <CardBody>Content here</CardBody>
</Card>;
```

### Modal

```jsx
import Modal from "./components/ui/Modal";

<Modal isOpen={isOpen} onClose={handleClose} title="Title">
  Modal content
</Modal>;
```

See [COMPONENTS.md](./COMPONENTS.md) for complete API documentation.

---

## 🔌 API Integration

API services are ready in `src/lib/api.js`:

```javascript
import { authService, eventService } from "./lib/api";

// Login
const { user, token } = await authService.login({ email, password });

// Get events
const events = await eventService.getEvents();
```

**Base URL:** `http://localhost:5000/api` (configured in `.env`)

---

## 🌐 Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Smart Campus Utility Hub
VITE_APP_VERSION=1.0.0
```

---

## 🐛 Troubleshooting

Having issues? Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Common fixes:**

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear cache and restart
npm cache clean --force
npm run dev

# Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

## 📊 Project Progress

### Phase 1: Foundation ✅ 100%

- [x] Project setup
- [x] Design system
- [x] UI component library
- [x] Layout system
- [x] State management
- [x] Routing
- [x] API integration layer
- [x] Documentation

### Phase 2: Authentication 🔜 0%

- [ ] Login/Register forms
- [ ] Form validation
- [ ] Lottie animations
- [ ] Enhanced landing page
- [ ] User dashboard

### Phase 3: Events Module 📅

- [ ] Event cards
- [ ] Filtering
- [ ] Save/unsave functionality
- [ ] Event details modal

### Phase 4: Electives & Timetable 📚

- [ ] Elective selection (drag-drop)
- [ ] Timetable viewer
- [ ] User profile
- [ ] Final polish

---

## 🎯 Quality Benchmarks

✅ **Performance**

- Fast HMR (<100ms)
- Optimized builds
- Code splitting ready

✅ **Accessibility**

- WCAG AA compliant
- Keyboard navigation
- Screen reader friendly
- Focus management

✅ **Responsive Design**

- Mobile-first
- Touch-friendly (44px targets)
- Fluid typography
- Flexible layouts

✅ **Code Quality**

- Clean architecture
- JSDoc comments
- Modular components
- Reusable utilities

---

## 🤝 Contributing

This is a learning project for the Smart Campus platform.

**Code Style:**

- Use functional components
- JSDoc comments for all components
- Descriptive variable names
- Keep components small and focused

---

## 📄 License

This project is part of the Smart Campus Utility Hub.

---

## 🙏 Acknowledgments

**Built with:**

- React Team
- Vite Team
- Tailwind Labs
- Framer Motion
- And many amazing open-source projects

**Inspired by:**

- chargeflow.io
- Modern SaaS applications
- Material Design principles

---

## 📞 Support

**Documentation:**

- [Quick Start Guide](./QUICKSTART.md)
- [Component Docs](./COMPONENTS.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

**Issues?**
Check the troubleshooting guide or create an issue with:

1. What you were trying to do
2. What happened
3. Error messages
4. Screenshots
5. Browser and OS

---

<div align="center">

**Made with ❤️ by the Smart Campus Team**

Phase 1 Complete ✅ | Ready for Phase 2 🚀

[Start Testing](#-quick-start) | [View Docs](#-documentation) | [Report Issue](./TROUBLESHOOTING.md)

</div>
