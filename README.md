# Calendar-Plus

Calendar-Plus is a calendar application project built with Next.js, React, TypeScript, Tailwind CSS, Drizzle ORM, and PostgreSQL.

The project currently includes a calendar interface with month, week, and day views, event management, and database integration. The application will be improved with additional functionality and UI enhancements as development progresses.

## Features

- Month, week, and day calendar views
- Create, edit, and delete calendar events
- Interactive event forms and popovers
- Database integration using Drizzle ORM
- Next.js App Router and Server Actions
- Responsive interface using Tailwind CSS
- UI state management with Zustand

These features should be verified by running the application and testing the relevant workflows.

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| State management | Zustand |
| Backend | Next.js Server Actions |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Icons | Lucide |

## Getting Started

### Prerequisites

- Node.js and npm
- A PostgreSQL-compatible database
- Git

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root and configure your own database connection:

```env
DATABASE_URL="your_database_connection_string"
```

Do not commit `.env` files, passwords, tokens, or other secrets.

### 3. Apply the database schema

```bash
npx drizzle-kit push
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
Calendar-Plus/
├── app/                # Next.js routes and application layout
├── components/         # Calendar UI components
├── db/                 # Database schema and configuration
├── lib/                # Utilities and state management
├── public/              # Static assets
├── drizzle.config.ts
├── package.json
└── README.md
```

## Potential Improvements

- User authentication and personal calendars
- Recurring events
- Drag-and-drop event rescheduling
- Improved event search and filtering
- Calendar synchronization
- Additional interface customization

These are potential future improvements, not claims about existing functionality.

## Original Source Acknowledgment

The starting codebase was obtained from [Google-Calendar by Sahil Vashisth](https://github.com/Sahilvashisth01/Google-Calendar).

The original repository README states that the project is MIT-licensed, but an actual license file has not been verified. The applicable license and attribution requirements must be confirmed before redistributing the source code. This README does not grant rights to third-party code or assets.