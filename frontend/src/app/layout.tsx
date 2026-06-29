import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'E-commerce Sales Dashboard',
  description: 'Panel de ventas para el dataset e-commerce de Olist',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
