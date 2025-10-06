import { Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    if (!user) {
        // User not authenticated, redirect to sign in
        return <Navigate to="/signin" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User doesn't have required role, redirect to unauthorized page
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="text-muted-foreground">You don't have permission to access this page.</p>
            </div>
        )
    }

    return <>{children}</>
}
