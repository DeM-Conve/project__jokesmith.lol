import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { createQueryClient } from './api/queryClient.js'
import { colorSchemeManager, cssVariablesResolver, theme } from './themes.js'

const queryClient = createQueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="auto" colorSchemeManager={colorSchemeManager} cssVariablesResolver={cssVariablesResolver}>
        <Notifications position="top-center" limit={3} />
        {/* BASE_URL is '/' or the build's sub-path ('/jokesmith.lol/'). */}
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
          <App />
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
)
