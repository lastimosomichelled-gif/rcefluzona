import './globals.css';

export const metadata = { title: 'RCEF Monitor' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
