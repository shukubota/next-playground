import React from 'react';
import { GoogleTagManager } from '@next/third-parties/google';
import "./global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleTagManager gtmId="GTM-N62ZNWG6" />
      </body>
    </html>
  )
}
