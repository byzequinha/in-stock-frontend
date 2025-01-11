import './globals.css';


export const metadata = {
    title: 'InStock',
    description: 'Sistema de controle de estoque',
  };
  
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="pt-BR">
        <body className="font-sans bg-gray-50 text-gray-800">{children}</body>
      </html>
    );
  }
  