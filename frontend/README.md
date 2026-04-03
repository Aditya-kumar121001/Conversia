# Conversia - AI Chatbot & Voicebot SaaS Platform

Conversia is a powerful, multi-tenant SaaS platform that allows businesses to create, manage, and embed intelligent Chatbots and Voicebots. Built with React and modern web technologies, it features an advanced customizable workflow engine, robust knowledge base integration, and a sleek user interface.

## 🚀 Key Features

*   **Multi-Domain Management:** Easily manage your bots across different domains and websites from a single dashboard.
*   **Conversational AI Chatbots:** Deploy smart textual chatbots with embeddable web widgets.
*   **Voicebots (ElevenLabs Integration):** Create highly realistic conversational voice agents utilizing ElevenLabs.
*   **Visual Workflow Builder:** A drag-and-drop workflow canvas (ReactFlow) to build custom bot logic, actions, triggers, and precise AI data extraction steps.
*   **Dynamic Knowledge Base:** Upload text and documents to train your agents on your specific business context.
*   **Embeddable Widget:** Easily embed the chatbot on any website using a single JavaScript snippet (`widget.js`).
*   **Execution Logs & Analytics:** Real-time logging of workflow executions to monitor and debug bot interactions perfectly.
*   **Multilingual Support:** Reach a global audience with extensive multi-language capabilities.
*   **Secure Authentication & Billing:** Built-in OTP/Email authentication and subscription management.

## 🏗️ Project Structure

The frontend is built with React, Vite, and Tailwind CSS + shadcn/ui.

```text
frontend/
├── public/                 # Static assets
│   └── widget.js           # The embeddable chatbot script for client websites
├── src/
│   ├── components/         # Reusable React components
│   │   ├── auth/           # Authentication (Email, OTP)
│   │   ├── billing/        # Subscription and Billing views
│   │   ├── domain/         # Domain creation and management wizards
│   │   ├── kb/             # Knowledge Base management
│   │   ├── setting/        # Global & Profile settings
│   │   ├── ui/             # UI elements (shadcn/ui components)
│   │   └── workflow/       # Visual Workflow Builder (ReactFlow canvas, Nodes)
│   ├── context/            # React Context providers for global state
│   ├── hooks/              # Custom React hooks (e.g., use-mobile)
│   ├── lib/                # Utilities, API client (workflowClient) & actions
│   ├── App.tsx             # Root Application layout & routing
│   └── main.tsx            # Application entry point
├── package.json            # Dependencies and scripts
└── vite.config.ts          # Vite bundler configuration
```

## 🛠️ Technology Stack

*   **Framework:** React 18
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui (Radix UI)
*   **Routing:** React Router DOM
*   **Workflow Engine:** React Flow (`@xyflow/react`)
*   **API Client:** Native `fetch` with RESTful JSON endpoints
*   **Voice AI:** ElevenLabs integrations

## ⚙️ Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm or yarn

### Installation

1.  Clone the repository and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Set up environment variables:
    Create a `.env` file in the `frontend` root and configure the necessary variables (e.g., backend API URL).
    ```env
    VITE_BACKEND_URL=http://localhost:3000
    ```

### Development Server

Start the development server with hot-module replacement (HMR):

```bash
npm run dev
# or
yarn dev
```

### Building for Production

To create a production-ready build:

```bash
npm run build
```
The output will be generated in the `dist` folder.

## 🤖 Embedding the Chatbot

Conversia chatbots can be embedded into any external website by simply adding the included widget script.

```html
<script src="https://your-conversia-domain.com/widget.js" data-domain-id="YOUR_DOMAIN_ID"></script>
```

## 🔀 Workflow Engine

The Visual Workflow Engine is a core component of Conversia. It allows users to define how the bot reacts to triggers (like "Conversation Started"). 
Nodes are defined in a custom backend catalog, and the frontend dynamically renders them via `metaSchema` properties (supporting text, JSON, selects, and textareas).

You can monitor these bots in real-time by checking out the **Execution Logs** tab.
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
