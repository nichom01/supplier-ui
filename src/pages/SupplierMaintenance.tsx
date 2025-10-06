"use client"

import { useState, useEffect } from "react"
import { PageHeader, PageHeaderHeading } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { suppliersApi } from "@/services/api"
import { Supplier } from "@/types"

const statuses = ["Active", "Inactive", "Pending", "Suspended"]

export default function SupplierMaintenance() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
    const [loading, setLoading] = useState(true)
    const [filterText, setFilterText] = useState("")
    const [formData, setFormData] = useState<Supplier>({
        name: "",
        contact_info: "",
        address_name: "",
        address_line1: "",
        address_line2: "",
        address_line3: "",
        address_line4: "",
        address_line5: "",
        address_postcode: "",
        status: "Active"
    })

    // Fetch suppliers on component mount
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const data = await suppliersApi.getAll()
                setSuppliers(data)
            } catch (error) {
                console.error('Failed to fetch suppliers:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSuppliers()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingSupplier?.supplier_id) {
                // Update existing supplier
                const updated = await suppliersApi.update(editingSupplier.supplier_id, {
                    ...formData,
                    supplier_id: editingSupplier.supplier_id
                })
                setSuppliers(suppliers.map(s =>
                    s.supplier_id === editingSupplier.supplier_id ? updated : s
                ))
            } else {
                // Create new supplier
                const newSupplier = await suppliersApi.create(formData)
                setSuppliers([...suppliers, newSupplier])
            }

            // Reset form
            setFormData({
                name: "",
                contact_info: "",
                address_name: "",
                address_line1: "",
                address_line2: "",
                address_line3: "",
                address_line4: "",
                address_line5: "",
                address_postcode: "",
                status: "Active"
            })
            setEditingSupplier(null)
        } catch (error) {
            console.error('Failed to save supplier:', error)
        }
    }

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier)
        setFormData(supplier)
    }

    const handleDelete = async (supplierId: number) => {
        try {
            await suppliersApi.delete(supplierId)
            setSuppliers(suppliers.filter(s => s.supplier_id !== supplierId))
        } catch (error) {
            console.error('Failed to delete supplier:', error)
        }
    }

    const handleCancel = () => {
        setFormData({
            name: "",
            contact_info: "",
            address_name: "",
            address_line1: "",
            address_line2: "",
            address_line3: "",
            address_line4: "",
            address_line5: "",
            address_postcode: "",
            status: "Active"
        })
        setEditingSupplier(null)
    }

    // Filter suppliers based on search text across all fields
    const filteredSuppliers = suppliers.filter(supplier => {
        if (!filterText) return true

        const searchText = filterText.toLowerCase()
        return (
            supplier.name.toLowerCase().includes(searchText) ||
            supplier.contact_info.toLowerCase().includes(searchText) ||
            supplier.address_name.toLowerCase().includes(searchText) ||
            supplier.address_line1.toLowerCase().includes(searchText) ||
            supplier.address_line2.toLowerCase().includes(searchText) ||
            supplier.address_line3.toLowerCase().includes(searchText) ||
            supplier.address_line4.toLowerCase().includes(searchText) ||
            supplier.address_line5.toLowerCase().includes(searchText) ||
            supplier.address_postcode.toLowerCase().includes(searchText) ||
            supplier.status.toLowerCase().includes(searchText)
        )
    })

    if (loading) {
        return (
            <>
                <PageHeader>
                    <PageHeaderHeading>Supplier Maintenance</PageHeaderHeading>
                </PageHeader>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading suppliers...</p>
                </div>
            </>
        )
    }

    return (
        <>
            <PageHeader>
                <PageHeaderHeading>Supplier Maintenance</PageHeaderHeading>
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{editingSupplier ? "Edit Supplier" : "Create New Supplier"}</CardTitle>
                        <CardDescription>
                            {editingSupplier ? "Update supplier information" : "Add a new supplier to the system"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Supplier Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Supplier name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_info">Contact Info</Label>
                                <Input
                                    id="contact_info"
                                    value={formData.contact_info}
                                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                                    placeholder="Email | Phone"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address_name">Address Name</Label>
                                <Input
                                    id="address_name"
                                    value={formData.address_name}
                                    onChange={(e) => setFormData({ ...formData, address_name: e.target.value })}
                                    placeholder="Address name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address_line1">Address Line 1</Label>
                                <Input
                                    id="address_line1"
                                    value={formData.address_line1}
                                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                                    placeholder="Street address"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address_line2">Address Line 2</Label>
                                <Input
                                    id="address_line2"
                                    value={formData.address_line2}
                                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                                    placeholder="Building, suite, etc."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address_line3">Address Line 3</Label>
                                <Input
                                    id="address_line3"
                                    value={formData.address_line3}
                                    onChange={(e) => setFormData({ ...formData, address_line3: e.target.value })}
                                    placeholder="City or town"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address_line4">Address Line 4</Label>
                                <Input
                                    id="address_line4"
                                    value={formData.address_line4}
                                    onChange={(e) => setFormData({ ...formData, address_line4: e.target.value })}
                                    placeholder="County or region"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address_line5">Address Line 5</Label>
                                <Input
                                    id="address_line5"
                                    value={formData.address_line5}
                                    onChange={(e) => setFormData({ ...formData, address_line5: e.target.value })}
                                    placeholder="Additional address info"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address_postcode">Postcode</Label>
                                <Input
                                    id="address_postcode"
                                    value={formData.address_postcode}
                                    onChange={(e) => setFormData({ ...formData, address_postcode: e.target.value })}
                                    placeholder="Postcode"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger id="status" tabIndex={0}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1" tabIndex={0}>
                                    {editingSupplier ? "Update Supplier" : "Create Supplier"}
                                </Button>
                                {editingSupplier && (
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
                        <CardTitle>Suppliers List</CardTitle>
                        <CardDescription>Manage your supplier database</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {suppliers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No suppliers yet. Create your first supplier to get started.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="filter">Filter Suppliers</Label>
                                    <Input
                                        id="filter"
                                        placeholder="Search by name, contact, address, or status..."
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                        tabIndex={-1}
                                    />
                                    {filterText && (
                                        <p className="text-xs text-muted-foreground">
                                            Showing {filteredSuppliers.length} of {suppliers.length} suppliers
                                        </p>
                                    )}
                                </div>
                                {filteredSuppliers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No suppliers match your filter.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredSuppliers.map((supplier) => (
                                    <div
                                        key={supplier.supplier_id}
                                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{supplier.name}</h4>
                                                <p className="text-sm text-muted-foreground">{supplier.contact_info}</p>
                                                <p className="text-sm mt-1">
                                                    {supplier.address_name}
                                                    {supplier.address_line1 && `, ${supplier.address_line1}`}
                                                    {supplier.address_line2 && `, ${supplier.address_line2}`}
                                                </p>
                                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span>{supplier.address_postcode}</span>
                                                    <span>Status: {supplier.status}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(supplier)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(supplier.supplier_id!)}
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
