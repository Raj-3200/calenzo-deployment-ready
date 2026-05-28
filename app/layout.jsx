import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata = {
  title: 'Calenzo',
  description: 'AI-ready clinic appointment, live queue, and operations platform.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ClerkProvider dynamic>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
