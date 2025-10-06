import { Customer, CustomersResponse } from "@/types"

const API_BASE_URL = '/api'

export const customersApi = {
    // Get all customers
    async getAll(): Promise<Customer[]> {
        const response = await fetch(`${API_BASE_URL}/customers`)
        if (!response.ok) {
            throw new Error('Failed to fetch customers')
        }
        const data: CustomersResponse = await response.json()
        return data.customers
    },

    // Get single customer by ID
    async getById(id: number): Promise<Customer> {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`)
        if (!response.ok) {
            throw new Error(`Failed to fetch customer ${id}`)
        }
        return response.json()
    },

    // Create new customer
    async create(customer: Omit<Customer, 'customer_id'>): Promise<Customer> {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customer),
        })
        if (!response.ok) {
            throw new Error('Failed to create customer')
        }
        return response.json()
    },

    // Update existing customer
    async update(id: number, customer: Customer): Promise<Customer> {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customer),
        })
        if (!response.ok) {
            throw new Error(`Failed to update customer ${id}`)
        }
        return response.json()
    },

    // Delete customer
    async delete(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) {
            throw new Error(`Failed to delete customer ${id}`)
        }
    },
}
