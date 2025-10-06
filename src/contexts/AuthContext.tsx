import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, AuthCredentials, SignUpData } from '@/types'
import { authApi } from '@/services/api'

interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    signIn: (credentials: AuthCredentials) => Promise<void>
    signUp: (data: SignUpData) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('auth_token')
            const storedUser = localStorage.getItem('auth_user')

            if (storedToken && storedUser) {
                try {
                    // Verify token is still valid
                    const { user } = await authApi.getCurrentUser(storedToken)
                    setUser(user)
                    setToken(storedToken)
                } catch (error) {
                    // Token invalid, clear storage
                    localStorage.removeItem('auth_token')
                    localStorage.removeItem('auth_user')
                }
            }

            setIsLoading(false)
        }

        initAuth()
    }, [])

    const signIn = async (credentials: AuthCredentials) => {
        try {
            const response = await authApi.signIn(credentials)
            setUser(response.user)
            setToken(response.token)
            localStorage.setItem('auth_token', response.token)
            localStorage.setItem('auth_user', JSON.stringify(response.user))
        } catch (error) {
            throw error
        }
    }

    const signUp = async (data: SignUpData) => {
        try {
            const response = await authApi.signUp(data)
            setUser(response.user)
            setToken(response.token)
            localStorage.setItem('auth_token', response.token)
            localStorage.setItem('auth_user', JSON.stringify(response.user))
        } catch (error) {
            throw error
        }
    }

    const signOut = async () => {
        try {
            if (token) {
                await authApi.signOut(token)
            }
        } catch (error) {
            // Ignore errors on sign out
        } finally {
            setUser(null)
            setToken(null)
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
        }
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
