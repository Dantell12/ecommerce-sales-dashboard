import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'E-commerce Sales Dashboard',
  description: 'Sales analytics dashboard for the Olist e-commerce dataset',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
