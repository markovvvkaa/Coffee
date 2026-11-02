import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/open-sans/cyrillic-400.css'
import '@fontsource/open-sans/cyrillic-600.css'
import '@fontsource/open-sans/cyrillic-700.css'
import '@fontsource/open-sans/latin-400.css'
import '@fontsource/open-sans/latin-700.css'
import '@fontsource/inter/cyrillic-400.css'
import '@fontsource/inter/cyrillic-500.css'
import '@fontsource/inter/cyrillic-600.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
