import type { User } from '@/types'

export const mockUsers: User[] = [
    {
        user_id: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
    },
    {
        user_id: 2,
        email: 'employee@example.com',
        name: 'Employee User',
        role: 'employee'
    },
    {
        user_id: 3,
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user'
    }
]

// Mock password storage (in real app, these would be hashed)
export const mockPasswords: Record<string, string> = {
    'admin@example.com': 'admin123',
    'employee@example.com': 'employee123',
    'user@example.com': 'user123'
}
