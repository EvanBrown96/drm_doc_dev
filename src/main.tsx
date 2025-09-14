import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { AppContextProvider } from './AppContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppContextProvider><App /></AppContextProvider>
  </StrictMode>,
)
