"use client"

import { useState, useEffect, useRef } from "react"
import { PageHeader, PageHeaderHeading } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Download, Upload, Edit, AlertCircle } from "lucide-react"
import { supplierPricingApi, suppliersApi } from "@/services/api"
import { SupplierPricing, SupplierPricingUpdateRequest, Supplier } from "@/types"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/utils"

export default function SupplierPricingMaintenance() {
    const [pricing, setPricing] = useState<SupplierPricing[]>([])
    const [filteredPricing, setFilteredPricing] = useState<SupplierPricing[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [selectedSupplier, setSelectedSupplier] = useState<string>("")
    const [editingPricing, setEditingPricing] = useState<SupplierPricing | null>(null)
    const [loading, setLoading] = useState(true)
    const [filterText, setFilterText] = useState("")
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [uploadErrors, setUploadErrors] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        price: "",
        daily_hire_rate: "",
        effective_from: new Date().toISOString().split('T')[0]
    })

    // Fetch suppliers and pricing on component mount
    useEffect(() => {
        fetchSuppliers()
        fetchAllPricing()
    }, [])

    // Filter pricing when supplier selection or search text changes
    useEffect(() => {
        let filtered = pricing

        // Filter by selected supplier
        if (selectedSupplier && selectedSupplier !== "all") {
            filtered = filtered.filter(p => p.supplier_id === Number(selectedSupplier))
        }

        // Filter by search text
        if (filterText) {
            filtered = filtered.filter(p =>
                p.sku.toLowerCase().includes(filterText.toLowerCase()) ||
                p.product_name.toLowerCase().includes(filterText.toLowerCase())
            )
        }

        setFilteredPricing(filtered)
    }, [filterText, pricing, selectedSupplier])

    const fetchSuppliers = async () => {
        try {
            const data = await suppliersApi.getAll()
            // Only show active suppliers
            const activeSuppliers = data.filter(s => s.status === 'Active')
            setSuppliers(activeSuppliers)
        } catch (error) {
            console.error('Failed to fetch suppliers:', error)
            toast.error('Failed to load suppliers')
        }
    }

    const fetchAllPricing = async () => {
        try {
            setLoading(true)
            const data = await supplierPricingApi.getAllSupplierPricing()
            setPricing(data)
            setFilteredPricing(data)
        } catch (error) {
            console.error('Failed to fetch supplier pricing:', error)
            toast.error('Failed to load supplier pricing data')
        } finally {
            setLoading(false)
        }
    }

    const fetchPricingBySupplier = async (supplierId: number) => {
        try {
            setLoading(true)
            const data = await supplierPricingApi.getSupplierPricingBySupplier(supplierId)
            setPricing(data)
            setFilteredPricing(data)
        } catch (error) {
            console.error('Failed to fetch supplier pricing:', error)
            toast.error('Failed to load supplier pricing data')
        } finally {
            setLoading(false)
        }
    }

    const handleSupplierChange = (value: string) => {
        setSelectedSupplier(value)
        if (value === "all") {
            fetchAllPricing()
        } else {
            fetchPricingBySupplier(Number(value))
        }
    }

    const handleEdit = (pricingRecord: SupplierPricing) => {
        setEditingPricing(pricingRecord)
        setFormData({
            price: pricingRecord.price?.toString() || "",
            daily_hire_rate: pricingRecord.daily_hire_rate?.toString() || "",
            effective_from: new Date().toISOString().split('T')[0]
        })
        setIsEditDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editingPricing) return

        try {
            const update: SupplierPricingUpdateRequest = {
                supplier_id: editingPricing.supplier_id,
                product_id: editingPricing.product_id,
                price: formData.price ? parseFloat(formData.price) : undefined,
                daily_hire_rate: formData.daily_hire_rate ? parseFloat(formData.daily_hire_rate) : undefined,
                effective_from: formData.effective_from
            }

            const updated = await supplierPricingApi.updateSupplierPricing(
                editingPricing.supplier_id,
                editingPricing.product_id,
                update
            )

            // Update local state
            setPricing(pricing.map(p =>
                p.supplier_id === editingPricing.supplier_id &&
                p.product_id === editingPricing.product_id ? updated : p
            ))

            toast.success('Supplier pricing updated successfully')
            setIsEditDialogOpen(false)
            setEditingPricing(null)
        } catch (error) {
            console.error('Failed to update supplier pricing:', error)
            toast.error('Failed to update supplier pricing')
        }
    }

    const handleDownloadCSV = () => {
        if (!selectedSupplier || selectedSupplier === "all") {
            toast.error('Please select a specific supplier to download pricing')
            return
        }

        // Create CSV content - SKU is the key field for identifying products
        const headers = ['SKU', 'Product Name', 'Product Type', 'Price', 'Daily Hire Rate', 'Effective From', 'Supplier ID', 'Supplier Name']
        const rows = filteredPricing.map(p => [
            p.sku,
            p.product_name,
            p.product_type,
            p.price || '',
            p.daily_hire_rate || '',
            p.effective_from,
            p.supplier_id,
            p.supplier_name
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => {
                // Escape quotes and wrap in quotes if contains comma
                const cellStr = String(cell)
                if (cellStr.includes(',') || cellStr.includes('"')) {
                    return `"${cellStr.replace(/"/g, '""')}"`
                }
                return cellStr
            }).join(','))
        ].join('\n')

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        const supplierName = suppliers.find(s => s.supplier_id === Number(selectedSupplier))?.name || 'unknown'
        link.setAttribute('href', url)
        link.setAttribute('download', `supplier_pricing_${supplierName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('Supplier pricing data exported to CSV')
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedFile(file)
            setUploadErrors([])
        }
    }

    const handleUploadCSV = async () => {
        if (!uploadedFile) {
            toast.error('Please select a file to upload')
            return
        }

        try {
            const text = await uploadedFile.text()
            const lines = text.split('\n').map(line => line.trim()).filter(line => line)

            if (lines.length < 2) {
                toast.error('CSV file is empty or invalid')
                return
            }

            // Helper function to parse CSV line properly handling empty fields
            const parseCSVLine = (line: string): string[] => {
                const result: string[] = []
                let current = ''
                let inQuotes = false

                for (let i = 0; i < line.length; i++) {
                    const char = line[i]
                    const nextChar = line[i + 1]

                    if (char === '"') {
                        if (inQuotes && nextChar === '"') {
                            // Escaped quote
                            current += '"'
                            i++ // Skip next quote
                        } else {
                            // Toggle quote mode
                            inQuotes = !inQuotes
                        }
                    } else if (char === ',' && !inQuotes) {
                        // End of field
                        result.push(current.trim())
                        current = ''
                    } else {
                        current += char
                    }
                }
                // Add last field
                result.push(current.trim())
                return result
            }

            // Parse CSV
            const headers = parseCSVLine(lines[0])
            const updates: SupplierPricingUpdateRequest[] = []
            const errors: string[] = []

            // Expected headers - SKU is now the primary identifier instead of Product ID
            const requiredHeaders = ['SKU', 'Product Type', 'Supplier ID']
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

            if (missingHeaders.length > 0) {
                toast.error('CSV is missing required headers')
                setUploadErrors([`Missing required headers: ${missingHeaders.join(', ')}`])
                return
            }

            // Get column indices
            const supplierIdIdx = headers.indexOf('Supplier ID')
            const skuIdx = headers.indexOf('SKU')
            const productTypeIdx = headers.indexOf('Product Type')
            const priceIdx = headers.indexOf('Price')
            const dailyHireRateIdx = headers.indexOf('Daily Hire Rate')
            const effectiveFromIdx = headers.indexOf('Effective From')

            // Parse data rows
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i]
                const cells = parseCSVLine(line)

                if (cells.length !== headers.length) {
                    errors.push(`Row ${i + 1}: Invalid number of columns (expected ${headers.length}, got ${cells.length})`)
                    continue
                }

                const supplierId = parseInt(cells[supplierIdIdx])
                const sku = cells[skuIdx]
                const productType = cells[productTypeIdx]
                const priceStr = cells[priceIdx]
                const dailyHireRateStr = cells[dailyHireRateIdx]
                const effectiveFrom = cells[effectiveFromIdx]

                if (isNaN(supplierId)) {
                    errors.push(`Row ${i + 1}: Invalid Supplier ID`)
                    continue
                }

                if (!sku || sku.trim() === '') {
                    errors.push(`Row ${i + 1}: SKU is required`)
                    continue
                }

                const update: SupplierPricingUpdateRequest = {
                    supplier_id: supplierId,
                    sku: sku.trim(),
                    effective_from: effectiveFrom || new Date().toISOString().split('T')[0]
                }

                if (productType === 'sale' && priceStr) {
                    const price = parseFloat(priceStr)
                    if (!isNaN(price)) {
                        update.price = price
                    } else {
                        errors.push(`Row ${i + 1}: Invalid price value`)
                        continue
                    }
                } else if (productType === 'hire' && dailyHireRateStr) {
                    const rate = parseFloat(dailyHireRateStr)
                    if (!isNaN(rate)) {
                        update.daily_hire_rate = rate
                    } else {
                        errors.push(`Row ${i + 1}: Invalid daily hire rate value`)
                        continue
                    }
                }

                updates.push(update)
            }

            if (updates.length === 0) {
                toast.error('No valid supplier pricing updates found in CSV')
                setUploadErrors(errors)
                return
            }

            // Upload to server
            const result = await supplierPricingApi.bulkUpdateSupplierPricing({ updates })

            if (result.errors.length > 0) {
                setUploadErrors([...errors, ...result.errors])
            }

            toast.success(`Successfully updated ${result.success} supplier pricing records${result.failed > 0 ? `, ${result.failed} failed` : ''}`)

            // Refresh pricing data
            if (selectedSupplier && selectedSupplier !== "all") {
                await fetchPricingBySupplier(Number(selectedSupplier))
            } else {
                await fetchAllPricing()
            }

            // Reset file input
            setUploadedFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (error) {
            console.error('Failed to upload CSV:', error)
            toast.error('Failed to process CSV file')
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <PageHeader>
                    <PageHeaderHeading>Supplier Pricing Maintenance</PageHeaderHeading>
                </PageHeader>
                <Card className="mt-6">
                    <CardContent className="py-8">
                        <div className="flex justify-center">Loading...</div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <PageHeader>
                <PageHeaderHeading>Supplier Pricing Maintenance</PageHeaderHeading>
            </PageHeader>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Manage Supplier Pricing</CardTitle>
                    <CardDescription>
                        Update supplier pricing individually or bulk upload via CSV spreadsheet. Use SKU to identify products when uploading. Filter by supplier to download pricing for a specific supplier.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Actions Bar */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="supplier-filter" className="mb-2 block">Filter by Supplier</Label>
                                <Select value={selectedSupplier} onValueChange={handleSupplierChange}>
                                    <SelectTrigger id="supplier-filter">
                                        <SelectValue placeholder="Select a supplier..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Suppliers</SelectItem>
                                        {suppliers.map(supplier => (
                                            <SelectItem key={supplier.supplier_id} value={supplier.supplier_id!.toString()}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="search-filter" className="mb-2 block">Search Products</Label>
                                <Input
                                    id="search-filter"
                                    placeholder="Search by SKU or product name..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2">
                            <Button
                                variant="outline"
                                onClick={handleDownloadCSV}
                                className="gap-2"
                                disabled={!selectedSupplier || selectedSupplier === "all"}
                            >
                                <Download className="h-4 w-4" />
                                Download CSV
                            </Button>
                            <div className="flex gap-2 flex-1">
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleUploadCSV}
                                    disabled={!uploadedFile}
                                    className="gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload CSV
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Upload Errors */}
                    {uploadErrors.length > 0 && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="font-semibold mb-2">Upload Errors:</div>
                                <ul className="list-disc list-inside space-y-1">
                                    {uploadErrors.slice(0, 10).map((error, idx) => (
                                        <li key={idx} className="text-sm">{error}</li>
                                    ))}
                                    {uploadErrors.length > 10 && (
                                        <li className="text-sm">... and {uploadErrors.length - 10} more errors</li>
                                    )}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Pricing Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Daily Hire Rate</TableHead>
                                    <TableHead>Effective From</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPricing.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            {selectedSupplier && selectedSupplier !== "all"
                                                ? "No pricing records found for this supplier"
                                                : "No pricing records found. Please select a supplier to view pricing."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPricing.map((p) => (
                                        <TableRow key={`${p.supplier_id}-${p.product_id}`}>
                                            <TableCell className="font-medium">{p.supplier_name}</TableCell>
                                            <TableCell>{p.sku}</TableCell>
                                            <TableCell>{p.product_name}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${p.product_type === 'sale'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                    }`}>
                                                    {p.product_type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(p.price)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(p.daily_hire_rate)}</TableCell>
                                            <TableCell>{p.effective_from}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(p)}
                                                    className="gap-2"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Supplier Pricing</DialogTitle>
                        <DialogDescription>
                            Update pricing for {editingPricing?.product_name} ({editingPricing?.sku}) from {editingPricing?.supplier_name}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            {editingPricing?.product_type === 'sale' && (
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (£)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            {editingPricing?.product_type === 'hire' && (
                                <div className="space-y-2">
                                    <Label htmlFor="daily_hire_rate">Daily Hire Rate (£)</Label>
                                    <Input
                                        id="daily_hire_rate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.daily_hire_rate}
                                        onChange={(e) => setFormData({ ...formData, daily_hire_rate: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="effective_from">Effective From</Label>
                                <Input
                                    id="effective_from"
                                    type="date"
                                    value={formData.effective_from}
                                    onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
