"use client"

import { useState, useEffect } from "react"
import { PageHeader, PageHeaderHeading } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import { productsApi } from "@/services/api"
import { Product } from "@/types"

const categories = ["Electronics", "Furniture", "Clothing", "Food", "Books", "Other"]
const unitsOfMeasure = ["kg", "lbs", "oz", "g", "piece", "box", "pallet"]

export default function ProductMaintenance() {
    const [products, setProducts] = useState<Product[]>([])
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState<Product>({
        sku: "",
        name: "",
        description: "",
        weight: 0,
        volume: 0,
        category: "",
        unit_of_measure: ""
    })

    // Fetch products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productsApi.getAll()
                setProducts(data)
            } catch (error) {
                console.error('Failed to fetch products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingProduct?.product_id) {
                // Update existing product
                const updated = await productsApi.update(editingProduct.product_id, {
                    ...formData,
                    product_id: editingProduct.product_id
                })
                setProducts(products.map(p =>
                    p.product_id === editingProduct.product_id ? updated : p
                ))
            } else {
                // Create new product
                const newProduct = await productsApi.create(formData)
                setProducts([...products, newProduct])
            }

            // Reset form
            setFormData({
                sku: "",
                name: "",
                description: "",
                weight: 0,
                volume: 0,
                category: "",
                unit_of_measure: ""
            })
            setEditingProduct(null)
        } catch (error) {
            console.error('Failed to save product:', error)
        }
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setFormData(product)
    }

    const handleDelete = async (productId: number) => {
        try {
            await productsApi.delete(productId)
            setProducts(products.filter(p => p.product_id !== productId))
        } catch (error) {
            console.error('Failed to delete product:', error)
        }
    }

    const handleCancel = () => {
        setFormData({
            sku: "",
            name: "",
            description: "",
            weight: 0,
            volume: 0,
            category: "",
            unit_of_measure: ""
        })
        setEditingProduct(null)
    }

    if (loading) {
        return (
            <>
                <PageHeader>
                    <PageHeaderHeading>Product Maintenance</PageHeaderHeading>
                </PageHeader>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading products...</p>
                </div>
            </>
        )
    }

    return (
        <>
            <PageHeader>
                <PageHeaderHeading>Product Maintenance</PageHeaderHeading>
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{editingProduct ? "Edit Product" : "Create New Product"}</CardTitle>
                        <CardDescription>
                            {editingProduct ? "Update product information" : "Add a new product to the system"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="PROD-001"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Product name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Product description"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.01"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="volume">Volume</Label>
                                    <Input
                                        id="volume"
                                        type="number"
                                        step="0.01"
                                        value={formData.volume}
                                        onChange={(e) => setFormData({ ...formData, volume: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit of Measure</Label>
                                <Select
                                    value={formData.unit_of_measure}
                                    onValueChange={(value) => setFormData({ ...formData, unit_of_measure: value })}
                                >
                                    <SelectTrigger id="unit">
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unitsOfMeasure.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">
                                    {editingProduct ? "Update Product" : "Create Product"}
                                </Button>
                                {editingProduct && (
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Products List</CardTitle>
                        <CardDescription>Manage your product catalog</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {products.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No products yet. Create your first product to get started.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {products.map((product) => (
                                    <div
                                        key={product.product_id}
                                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{product.name}</h4>
                                                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                                <p className="text-sm mt-1">{product.description}</p>
                                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span>Weight: {product.weight}</span>
                                                    <span>Volume: {product.volume}</span>
                                                    <span>Category: {product.category}</span>
                                                    <span>Unit: {product.unit_of_measure}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(product.product_id!)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
