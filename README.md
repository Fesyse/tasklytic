# Froo

A modern, feature-rich web application built with Next.js, React, and TypeScript, featuring a powerful calendar system, rich text editing, and more.

## 🚀 Features

- **Advanced Calendar System**

  - Multiple views (Day, Week, Month, Year, Agenda)
  - Drag and drop event management
  - User-specific calendars
  - Customizable working hours
  - Responsive design

- **Rich Text Editor**

  - Powered by Plate.js
  - AI-assisted editing
  - Markdown support
  - Code blocks with syntax highlighting
  - Tables, lists, and media embedding

- **Modern UI Components**

  - Built with Radix UI primitives
  - Dark mode support
  - Responsive design
  - Accessible components
  - Custom animations

- **Advanced Features**
  - Email integration with React Email
  - File uploads with UploadThing
  - Real-time AI capabilities
  - PDF manipulation
  - Data visualization with Recharts

## 🛠️ Tech Stack

- **Framework:** Next.js 15.4 (Canary)
- **Language:** TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Styling:** Tailwind CSS
- **Authentication:** Custom auth system
- **State Management:** React Query, TanStack
- **UI Components:** Radix UI, Ariakit
- **Drag & Drop:** DND Kit
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **API Layer:** tRPC
- **Package Manager:** pnpm

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10.6.1+
- PostgreSQL

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/froo.git
   cd froo
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

3. Set up your environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Set up the database:
   \`\`\`bash
   pnpm db:setup
   \`\`\`

5. Start the development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

## 📝 Available Scripts

- \`pnpm dev\` - Start development server with Turbo
- \`pnpm build\` - Build the production application
- \`pnpm start\` - Start the production server
- \`pnpm check\` - Run linting and type checking
- \`pnpm db:generate\` - Generate database migrations
- \`pnpm db:push\` - Push database changes
- \`pnpm db:seed\` - Seed the database
- \`pnpm email:dev\` - Start email preview server
- \`pnpm format:write\` - Format code with Prettier
- \`pnpm lint\` - Lint code with ESLint
- \`pnpm typecheck\` - Check types with TypeScript

## 🏗️ Project Structure

\`\`\`
froo/
├── src/
│ ├── calendar/ # Calendar module
│ ├── server/ # Backend API and database
│ ├── components/ # Shared React components
│ ├── lib/ # Utility functions
│ ├── styles/ # Global styles
│ └── pages/ # Next.js pages
├── emails/ # Email templates
├── public/ # Static assets
├── drizzle/ # Database migrations
└── ... # Config files
\`\`\`

## 📚 Documentation

For detailed documentation about specific modules:

- [Calendar Module](./src/calendar/README.md)
- [API Documentation](./src/server/api/README.md)
- [Component Library](./src/components/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add some amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Plate](https://platejs.org/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
