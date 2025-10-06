import { BrowserRouter, HashRouter } from 'react-router'
import { ThemeProvider } from './contexts/ThemeContext'
import { CartProvider } from './contexts/CartContext'
import { Toaster } from './components/ui/sonner'
import Router from './Router'

const AppRouter = import.meta.env.VITE_USE_HASH_ROUTE === 'true' ? HashRouter : BrowserRouter

export default function App() {
    return (
        <ThemeProvider>
            <CartProvider>
                <AppRouter>
                    <Router />
                    <Toaster />
                </AppRouter>
            </CartProvider>
        </ThemeProvider>
    )
}
