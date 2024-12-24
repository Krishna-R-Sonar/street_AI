import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="flex items-center justify-between p-4 shadow">
          <h1 className="text-lg font-bold">Multi-Step Form</h1>
        </header>
        {children}
      </body>
    </html>
  )
}
