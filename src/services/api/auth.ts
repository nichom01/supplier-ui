import type { AuthCredentials, AuthResponse, SignUpData, User } from '@/types'

const API_BASE = '/api'

export const authApi = {
    // Sign in
    async signIn(credentials: AuthCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Sign in failed')
        }

        return response.json()
    },

    // Sign up
    async signUp(data: SignUpData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Sign up failed')
        }

        return response.json()
    },

    // Sign out
    async signOut(token: string): Promise<void> {
        const response = await fetch(`${API_BASE}/auth/signout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error('Sign out failed')
        }
    },

    // Get current user (verify token)
    async getCurrentUser(token: string): Promise<{ user: User }> {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error('Unauthorized')
        }

        return response.json()
    }
}
