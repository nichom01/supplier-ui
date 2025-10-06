"use client"

import { useState, useEffect } from "react"
import { PageHeader, PageHeaderHeading } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { customersApi } from "@/services/api"
import { Customer } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const customerTypes = ["Retail", "Wholesale", "Distributor", "Online", "Other"]

export default function CustomerMaintenance() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [loading, setLoading] = useState(true)
    const [filterText, setFilterText] = useState("")
    const [formData, setFormData] = useState<Customer>({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        shipping_address_name: "",
        shipping_address_line1: "",
        shipping_address_line2: "",
        shipping_address_line3: "",
        shipping_address_line4: "",
        shipping_address_line5: "",
        shipping_address_postcode: "",
        billing_address_name: "",
        billing_address_line1: "",
        billing_address_line2: "",
        billing_address_line3: "",
        billing_address_line4: "",
        billing_address_line5: "",
        billing_address_postcode: "",
        customer_type: ""
    })

    // Fetch customers on component mount
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await customersApi.getAll()
                setCustomers(data)
            } catch (error) {
                console.error('Failed to fetch customers:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCustomers()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingCustomer?.customer_id) {
                // Update existing customer
                const updated = await customersApi.update(editingCustomer.customer_id, {
                    ...formData,
                    customer_id: editingCustomer.customer_id
                })
                setCustomers(customers.map(c =>
                    c.customer_id === editingCustomer.customer_id ? updated : c
                ))
            } else {
                // Create new customer
                const newCustomer = await customersApi.create(formData)
                setCustomers([...customers, newCustomer])
            }

            // Reset form
            setFormData({
                name: "",
                contact_person: "",
                email: "",
                phone: "",
                shipping_address_name: "",
                shipping_address_line1: "",
                shipping_address_line2: "",
                shipping_address_line3: "",
                shipping_address_line4: "",
                shipping_address_line5: "",
                shipping_address_postcode: "",
                billing_address_name: "",
                billing_address_line1: "",
                billing_address_line2: "",
                billing_address_line3: "",
                billing_address_line4: "",
                billing_address_line5: "",
                billing_address_postcode: "",
                customer_type: ""
            })
            setEditingCustomer(null)
        } catch (error) {
            console.error('Failed to save customer:', error)
        }
    }

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer)
        setFormData(customer)
    }

    const handleDelete = async (customerId: number) => {
        try {
            await customersApi.delete(customerId)
            setCustomers(customers.filter(c => c.customer_id !== customerId))
        } catch (error) {
            console.error('Failed to delete customer:', error)
        }
    }

    const handleCancel = () => {
        setFormData({
            name: "",
            contact_person: "",
            email: "",
            phone: "",
            shipping_address_name: "",
            shipping_address_line1: "",
            shipping_address_line2: "",
            shipping_address_line3: "",
            shipping_address_line4: "",
            shipping_address_line5: "",
            shipping_address_postcode: "",
            billing_address_name: "",
            billing_address_line1: "",
            billing_address_line2: "",
            billing_address_line3: "",
            billing_address_line4: "",
            billing_address_line5: "",
            billing_address_postcode: "",
            customer_type: ""
        })
        setEditingCustomer(null)
    }

    // Filter customers based on search text across all fields
    const filteredCustomers = customers.filter(customer => {
        if (!filterText) return true

        const searchText = filterText.toLowerCase()
        return (
            customer.name.toLowerCase().includes(searchText) ||
            customer.contact_person.toLowerCase().includes(searchText) ||
            customer.email.toLowerCase().includes(searchText) ||
            customer.phone.toLowerCase().includes(searchText) ||
            customer.customer_type.toLowerCase().includes(searchText) ||
            customer.shipping_address_postcode.toLowerCase().includes(searchText) ||
            customer.billing_address_postcode.toLowerCase().includes(searchText)
        )
    })

    if (loading) {
        return (
            <>
                <PageHeader>
                    <PageHeaderHeading>Customer Maintenance</PageHeaderHeading>
                </PageHeader>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading customers...</p>
                </div>
            </>
        )
    }

    return (
        <>
            <PageHeader>
                <PageHeaderHeading>Customer Maintenance</PageHeaderHeading>
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{editingCustomer ? "Edit Customer" : "Create New Customer"}</CardTitle>
                        <CardDescription>
                            {editingCustomer ? "Update customer information" : "Add a new customer to the system"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Tabs defaultValue="general" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="general" tabIndex={0}>General</TabsTrigger>
                                    <TabsTrigger value="shipping" tabIndex={0}>Shipping</TabsTrigger>
                                    <TabsTrigger value="billing" tabIndex={0}>Billing</TabsTrigger>
                                </TabsList>

                                <TabsContent value="general" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Customer Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Customer name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person">Contact Person</Label>
                                        <Input
                                            id="contact_person"
                                            value={formData.contact_person}
                                            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                            placeholder="Contact person name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="email@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+44 20 1234 5678"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer_type">Customer Type</Label>
                                        <Select
                                            value={formData.customer_type}
                                            onValueChange={(value) => setFormData({ ...formData, customer_type: value })}
                                        >
                                            <SelectTrigger id="customer_type" tabIndex={0}>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customerTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TabsContent>

                                <TabsContent value="shipping" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="shipping_address_name">Address Name</Label>
                                        <Input
                                            id="shipping_address_name"
                                            value={formData.shipping_address_name}
                                            onChange={(e) => setFormData({ ...formData, shipping_address_name: e.target.value })}
                                            placeholder="Address name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="shipping_address_line1">Address Line 1</Label>
                                        <Input
                                            id="shipping_address_line1"
                                            value={formData.shipping_address_line1}
                                            onChange={(e) => setFormData({ ...formData, shipping_address_line1: e.target.value })}
                                            placeholder="Street address"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="shipping_address_line2">Address Line 2</Label>
                                        <Input
                                            id="shipping_address_line2"
                                            value={formData.shipping_address_line2}
                                            onChange={(e) => setFormData({ ...formData, shipping_address_line2: e.target.value })}
                                            placeholder="City"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="shipping_address_line3">Address Line 3</Label>
                                        <Input
                                            id="shipping_address_line3"
                                            value={formData.shipping_address_line3}
                                            onChange={(e) => setFormData({ ...formData, shipping_address_line3: e.target.value })}
                                            placeholder="County"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="shipping_address_line4">Address Line 4</Label>
                                        <Input
                                            id="shipping_address_line4"
                                            value={formData.shipping_address_line4}
                                            onChange={(e) => setFormData({ ...formData, shipping_address_line4: e.target.value })}
                                            placeholder="Region"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="shipping_address_line5">Address Line 5</Label>
                                        <Input
                                            id="shipping_address_line5"
                                            value={formData.shipping_address_line5}
                                            onChange={(e) => setFormData({ ...formData, shipping_address_line5: e.target.value })}
                                            placeholder="Additional details"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="shipping_address_postcode">Postcode</Label>
                                        <Input
                                            id="shipping_address_postcode"
                                            value={formData.shipping_address_postcode}
                                            onChange={(e) => setFormData({ ...formData, shipping_address_postcode: e.target.value })}
                                            placeholder="Postcode"
                                            required
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="billing" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_address_name">Address Name</Label>
                                        <Input
                                            id="billing_address_name"
                                            value={formData.billing_address_name}
                                            onChange={(e) => setFormData({ ...formData, billing_address_name: e.target.value })}
                                            placeholder="Address name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="billing_address_line1">Address Line 1</Label>
                                        <Input
                                            id="billing_address_line1"
                                            value={formData.billing_address_line1}
                                            onChange={(e) => setFormData({ ...formData, billing_address_line1: e.target.value })}
                                            placeholder="Street address"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="billing_address_line2">Address Line 2</Label>
                                        <Input
                                            id="billing_address_line2"
                                            value={formData.billing_address_line2}
                                            onChange={(e) => setFormData({ ...formData, billing_address_line2: e.target.value })}
                                            placeholder="City"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="billing_address_line3">Address Line 3</Label>
                                        <Input
                                            id="billing_address_line3"
                                            value={formData.billing_address_line3}
                                            onChange={(e) => setFormData({ ...formData, billing_address_line3: e.target.value })}
                                            placeholder="County"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="billing_address_line4">Address Line 4</Label>
                                        <Input
                                            id="billing_address_line4"
                                            value={formData.billing_address_line4}
                                            onChange={(e) => setFormData({ ...formData, billing_address_line4: e.target.value })}
                                            placeholder="Region"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="billing_address_line5">Address Line 5</Label>
                                        <Input
                                            id="billing_address_line5"
                                            value={formData.billing_address_line5}
                                            onChange={(e) => setFormData({ ...formData, billing_address_line5: e.target.value })}
                                            placeholder="Additional details"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="billing_address_postcode">Postcode</Label>
                                        <Input
                                            id="billing_address_postcode"
                                            value={formData.billing_address_postcode}
                                            onChange={(e) => setFormData({ ...formData, billing_address_postcode: e.target.value })}
                                            placeholder="Postcode"
                                            required
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" className="flex-1" tabIndex={0}>
                                    {editingCustomer ? "Update Customer" : "Create Customer"}
                                </Button>
                                {editingCustomer && (
                                    <Button type="button" variant="outline" onClick={handleCancel} tabIndex={0}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customers List</CardTitle>
                        <CardDescription>Manage your customer database</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {customers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No customers yet. Create your first customer to get started.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="filter">Filter Customers</Label>
                                    <Input
                                        id="filter"
                                        placeholder="Search by name, contact, email, phone, type, or postcode..."
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                        tabIndex={-1}
                                    />
                                    {filterText && (
                                        <p className="text-xs text-muted-foreground">
                                            Showing {filteredCustomers.length} of {customers.length} customers
                                        </p>
                                    )}
                                </div>
                                {filteredCustomers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No customers match your filter.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredCustomers.map((customer) => (
                                    <div
                                        key={customer.customer_id}
                                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{customer.name}</h4>
                                                <p className="text-sm text-muted-foreground">Contact: {customer.contact_person}</p>
                                                <p className="text-sm mt-1">{customer.email} • {customer.phone}</p>
                                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span>Type: {customer.customer_type}</span>
                                                    <span>Ship: {customer.shipping_address_postcode}</span>
                                                    <span>Bill: {customer.billing_address_postcode}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(customer)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(customer.customer_id!)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
