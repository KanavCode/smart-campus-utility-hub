## Smart Campus Frontend

React + TypeScript frontend for Smart Campus Utility Hub.

### Prerequisites

- Node.js 18+
- npm 9+

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Create local environment file:

```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL` in `.env` (default backend URL is `http://localhost:5000/api`).

3. Run development server:

```bash
npm run dev
```

### Useful Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type-checking
- `npm run test` - Run unit tests with Vitest
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues where possible
- `npm run preview` - Preview production build

### Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

### Notes for Contributors

- Do not commit `.env` files.
- Keep service-layer changes in `src/services/`.
- Prefer reusable UI components in `src/components/ui/`.

