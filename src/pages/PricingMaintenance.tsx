"use client"

import { useState, useEffect, useRef } from "react"
import { PageHeader, PageHeaderHeading } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { pricingApi } from "@/services/api"
import { DefaultPricing, PricingUpdateRequest } from "@/types"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PricingMaintenance() {
    const [pricing, setPricing] = useState<DefaultPricing[]>([])
    const [filteredPricing, setFilteredPricing] = useState<DefaultPricing[]>([])
    const [editingPricing, setEditingPricing] = useState<DefaultPricing | null>(null)
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

    // Fetch pricing on component mount
    useEffect(() => {
        fetchPricing()
    }, [])

    // Filter pricing when search text changes
    useEffect(() => {
        if (filterText) {
            const filtered = pricing.filter(p =>
                p.sku.toLowerCase().includes(filterText.toLowerCase()) ||
                p.product_name.toLowerCase().includes(filterText.toLowerCase())
            )
            setFilteredPricing(filtered)
        } else {
            setFilteredPricing(pricing)
        }
    }, [filterText, pricing])

    const fetchPricing = async () => {
        try {
            setLoading(true)
            const data = await pricingApi.getAllPricing()
            // Filter to only show current pricing (no effective_to date)
            const currentPricing = data.filter(p => !p.effective_to)
            setPricing(currentPricing)
            setFilteredPricing(currentPricing)
        } catch (error) {
            console.error('Failed to fetch pricing:', error)
            toast.error('Failed to load pricing data')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (pricingRecord: DefaultPricing) => {
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
            const update: PricingUpdateRequest = {
                product_id: editingPricing.product_id,
                price: formData.price ? parseFloat(formData.price) : undefined,
                daily_hire_rate: formData.daily_hire_rate ? parseFloat(formData.daily_hire_rate) : undefined,
                effective_from: formData.effective_from
            }

            const updated = await pricingApi.updatePricing(editingPricing.product_id, update)

            // Update local state
            setPricing(pricing.map(p =>
                p.product_id === editingPricing.product_id ? updated : p
            ))

            toast.success('Pricing updated successfully')
            setIsEditDialogOpen(false)
            setEditingPricing(null)
        } catch (error) {
            console.error('Failed to update pricing:', error)
            toast.error('Failed to update pricing')
        }
    }

    const handleDownloadCSV = () => {
        // Create CSV content
        const headers = ['Product ID', 'SKU', 'Product Name', 'Product Type', 'Price', 'Daily Hire Rate', 'Effective From']
        const rows = filteredPricing.map(p => [
            p.product_id,
            p.sku,
            p.product_name,
            p.product_type,
            p.price || '',
            p.daily_hire_rate || '',
            p.effective_from
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
        link.setAttribute('href', url)
        link.setAttribute('download', `pricing_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('Pricing data exported to CSV')
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
            const updates: PricingUpdateRequest[] = []
            const errors: string[] = []

            // Expected headers
            const expectedHeaders = ['Product ID', 'SKU', 'Product Name', 'Product Type', 'Price', 'Daily Hire Rate', 'Effective From']
            const headerCheck = expectedHeaders.every(h => headers.includes(h))

            if (!headerCheck) {
                toast.error('CSV headers do not match expected format')
                setUploadErrors([`Expected headers: ${expectedHeaders.join(', ')}`])
                return
            }

            // Get column indices
            const productIdIdx = headers.indexOf('Product ID')
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

                const productId = parseInt(cells[productIdIdx])
                const productType = cells[productTypeIdx]
                const priceStr = cells[priceIdx]
                const dailyHireRateStr = cells[dailyHireRateIdx]
                const effectiveFrom = cells[effectiveFromIdx]

                if (isNaN(productId)) {
                    errors.push(`Row ${i + 1}: Invalid Product ID`)
                    continue
                }

                const update: PricingUpdateRequest = {
                    product_id: productId,
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
                toast.error('No valid pricing updates found in CSV')
                setUploadErrors(errors)
                return
            }

            // Upload to server
            const result = await pricingApi.bulkUpdatePricing({ updates })

            if (result.errors.length > 0) {
                setUploadErrors([...errors, ...result.errors])
            }

            toast.success(`Successfully updated ${result.success} pricing records${result.failed > 0 ? `, ${result.failed} failed` : ''}`)

            // Refresh pricing data
            await fetchPricing()

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

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined) return '-'
        return `$${value.toFixed(2)}`
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <PageHeader>
                    <PageHeaderHeading>Pricing Maintenance</PageHeaderHeading>
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
                <PageHeaderHeading>Pricing Maintenance</PageHeaderHeading>
            </PageHeader>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Manage Default Pricing</CardTitle>
                    <CardDescription>
                        Update product pricing individually or bulk upload via CSV spreadsheet
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Actions Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by SKU or product name..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleDownloadCSV}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download CSV
                            </Button>
                            <div className="flex gap-2">
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="max-w-[200px]"
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
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No pricing records found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPricing.map((p) => (
                                        <TableRow key={p.product_id}>
                                            <TableCell className="font-medium">{p.sku}</TableCell>
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
                        <DialogTitle>Edit Pricing</DialogTitle>
                        <DialogDescription>
                            Update pricing for {editingPricing?.product_name} ({editingPricing?.sku})
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            {editingPricing?.product_type === 'sale' && (
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price ($)</Label>
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
                                    <Label htmlFor="daily_hire_rate">Daily Hire Rate ($)</Label>
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
