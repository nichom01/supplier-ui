import { BrowserRouter, HashRouter } from 'react-router'
import { ThemeProvider } from './contexts/ThemeContext'
import { BasketProvider } from './contexts/BasketContext'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/sonner'
import Router from './Router'

const AppRouter = import.meta.env.VITE_USE_HASH_ROUTE === 'true' ? HashRouter : BrowserRouter

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BasketProvider>
                    <AppRouter>
                        <Router />
                        <Toaster />
                    </AppRouter>
                </BasketProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}
