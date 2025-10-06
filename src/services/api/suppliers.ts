import { Supplier, SuppliersResponse } from "@/types"

const API_BASE_URL = '/api'

export const suppliersApi = {
    // Get all suppliers
    async getAll(): Promise<Supplier[]> {
        const response = await fetch(`${API_BASE_URL}/suppliers`)
        if (!response.ok) {
            throw new Error('Failed to fetch suppliers')
        }
        const data: SuppliersResponse = await response.json()
        return data.suppliers
    },

    // Get single supplier by ID
    async getById(id: number): Promise<Supplier> {
        const response = await fetch(`${API_BASE_URL}/suppliers/${id}`)
        if (!response.ok) {
            throw new Error(`Failed to fetch supplier ${id}`)
        }
        return response.json()
    },

    // Create new supplier
    async create(supplier: Omit<Supplier, 'supplier_id'>): Promise<Supplier> {
        const response = await fetch(`${API_BASE_URL}/suppliers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(supplier),
        })
        if (!response.ok) {
            throw new Error('Failed to create supplier')
        }
        return response.json()
    },

    // Update existing supplier
    async update(id: number, supplier: Supplier): Promise<Supplier> {
        const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(supplier),
        })
        if (!response.ok) {
            throw new Error(`Failed to update supplier ${id}`)
        }
        return response.json()
    },

    // Delete supplier
    async delete(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) {
            throw new Error(`Failed to delete supplier ${id}`)
        }
    },
}
