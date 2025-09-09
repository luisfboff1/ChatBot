
import './globals.css';
import React from 'react';

export const metadata = {
  title: 'CHATBOT MULTISOCIOS',
  description: 'Chatbot multi-tenant com múltiplos modelos de IA'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="mx-auto max-w-4xl p-6">
          <header className="mb-8 text-center">
            <h1>CHATBOT MULTISOCIOS</h1>
            <p>Chatbot multi-tenant com múltiplos modelos de IA</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
