import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Supplier, Product, POLineItem, SupplierPricing } from '@/types'
import { suppliersApi, productsApi, purchaseOrdersApi, supplierPricingApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Package, Plus, Trash2 } from 'lucide-react'

type BasketItem = {
    product: Product
    quantity: number
    unit_price: number
}

export default function CreatePurchaseOrder() {
    const navigate = useNavigate()
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [supplierPricing, setSupplierPricing] = useState<SupplierPricing[]>([])
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>('')
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
    const [deliveryDate, setDeliveryDate] = useState('')
    const [basket, setBasket] = useState<BasketItem[]>([])
    const [selectedProductId, setSelectedProductId] = useState<string>('')
    const [quantity, setQuantity] = useState<number>(1)
    const [unitPrice, setUnitPrice] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadSuppliers()
        loadProducts()
        // Set default delivery date to 14 days from now
        const defaultDate = new Date()
        defaultDate.setDate(defaultDate.getDate() + 14)
        setDeliveryDate(defaultDate.toISOString().split('T')[0])
    }, [])

    useEffect(() => {
        if (selectedSupplierId && suppliers.length > 0) {
            const supplier = suppliers.find(s => s.supplier_id === Number(selectedSupplierId))
            if (supplier) {
                setSelectedSupplier(supplier)
                // Clear basket when changing supplier
                setBasket([])
                // Load pricing for this supplier
                loadSupplierPricing(Number(selectedSupplierId))
            }
        } else {
            setSelectedSupplier(null)
            setSupplierPricing([])
        }
    }, [selectedSupplierId, suppliers])

    // Load supplier pricing when product is selected
    useEffect(() => {
        if (selectedProductId && selectedSupplierId) {
            loadSupplierPrice(Number(selectedSupplierId), Number(selectedProductId))
        } else if (selectedProductId) {
            // If product selected but no supplier, use default product price
            const product = products.find(p => p.product_id === Number(selectedProductId))
            setUnitPrice(product?.price || product?.daily_hire_rate || 0)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProductId])

    const loadSuppliers = async () => {
        try {
            const data = await suppliersApi.getAll()
            setSuppliers(data.filter(s => s.status === 'Active'))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load suppliers')
        } finally {
            setIsLoading(false)
        }
    }

    const loadProducts = async () => {
        try {
            const data = await productsApi.getAll()
            setProducts(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products')
        }
    }

    const loadSupplierPricing = async (supplierId: number) => {
        try {
            const pricing = await supplierPricingApi.getSupplierPricingBySupplier(supplierId)
            setSupplierPricing(pricing)
        } catch (err) {
            console.error('Failed to load supplier pricing:', err)
            setSupplierPricing([])
        }
    }

    const loadSupplierPrice = async (supplierId: number, productId: number) => {
        try {
            const pricing = await supplierPricingApi.getSupplierPricingBySupplier(supplierId)
            const productPricing = pricing.find(p => p.product_id === productId)
            if (productPricing) {
                setUnitPrice(productPricing.price || productPricing.daily_hire_rate || 0)
            } else {
                // Fallback to product's default price
                const product = products.find(p => p.product_id === productId)
                setUnitPrice(product?.price || product?.daily_hire_rate || 0)
            }
        } catch (err) {
            // Fallback to product's default price
            const product = products.find(p => p.product_id === productId)
            setUnitPrice(product?.price || product?.daily_hire_rate || 0)
        }
    }

    const getAvailableProducts = () => {
        if (!selectedSupplierId || supplierPricing.length === 0) return []

        // Only show products that have pricing for this supplier
        const availableProductIds = supplierPricing.map(p => p.product_id)
        return products.filter(p => availableProductIds.includes(p.product_id))
    }

    const addToBasket = () => {
        if (!selectedProductId) {
            setError('Please select a product')
            return
        }

        if (quantity <= 0) {
            setError('Quantity must be greater than 0')
            return
        }

        const product = products.find(p => p.product_id === Number(selectedProductId))
        if (!product) return

        // Check if product already in basket
        const existingItem = basket.find(item => item.product.product_id === product.product_id)
        if (existingItem) {
            setError('Product already in basket. Remove it first to change quantity.')
            return
        }

        setBasket([...basket, {
            product,
            quantity,
            unit_price: unitPrice
        }])

        // Reset form
        setSelectedProductId('')
        setQuantity(1)
        setUnitPrice(0)
        setError(null)
    }

    const removeFromBasket = (productId: number) => {
        setBasket(basket.filter(item => item.product.product_id !== productId))
    }

    const calculateTotal = () => {
        return basket.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    }

    const handleCreatePurchaseOrder = async () => {
        if (!selectedSupplierId) {
            setError('Please select a supplier')
            return
        }

        if (basket.length === 0) {
            setError('Please add at least one product to the order')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            await purchaseOrdersApi.create({
                supplier_id: Number(selectedSupplierId),
                delivery_date: new Date(deliveryDate).toISOString(),
                lines: basket.map(item => ({
                    product_id: item.product.product_id!,
                    quantity_ordered: item.quantity,
                    unit_price: item.unit_price
                }))
            })

            // Navigate to purchase orders list
            navigate('/purchase-orders')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create purchase order')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/purchase-orders')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold">Create Purchase Order</h1>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded">
                    {error}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Supplier Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Supplier Information</CardTitle>
                        <CardDescription>Select the supplier for this purchase order</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="supplier">Supplier *</Label>
                            <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                                <SelectTrigger id="supplier">
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(supplier => (
                                        <SelectItem key={supplier.supplier_id} value={supplier.supplier_id!.toString()}>
                                            {supplier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedSupplier && (
                            <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
                                {selectedSupplier.contact_info && <p>{selectedSupplier.contact_info}</p>}
                                {selectedSupplier.address_line1 && <p>{selectedSupplier.address_line1}</p>}
                                {selectedSupplier.address_line2 && <p>{selectedSupplier.address_line2}</p>}
                                {selectedSupplier.address_postcode && <p>{selectedSupplier.address_postcode}</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delivery Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Information</CardTitle>
                        <CardDescription>Set the expected delivery date</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="delivery-date">Expected Delivery Date *</Label>
                            <Input
                                id="delivery-date"
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Products Section */}
            {selectedSupplierId && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Products</CardTitle>
                        <CardDescription>Add products to this purchase order</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="product">Product</Label>
                                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                    <SelectTrigger id="product">
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableProducts().map(product => (
                                            <SelectItem key={product.product_id} value={product.product_id!.toString()}>
                                                {product.name} ({product.sku})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit-price">Unit Price (£)</Label>
                                <Input
                                    id="unit-price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={unitPrice}
                                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                                />
                            </div>

                            <div className="flex items-end">
                                <Button onClick={addToBasket} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Order Items Table */}
            {basket.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                        <CardDescription>{basket.length} item(s) in order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {basket.map(item => (
                                    <TableRow key={item.product.product_id}>
                                        <TableCell className="font-medium">{item.product.name}</TableCell>
                                        <TableCell>{item.product.sku}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">£{item.unit_price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            £{(item.quantity * item.unit_price).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFromBasket(item.product.product_id!)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={4} className="text-right font-semibold">Total</TableCell>
                                    <TableCell className="text-right font-bold">
                                        £{calculateTotal().toFixed(2)}
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => navigate('/purchase-orders')}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreatePurchaseOrder} disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Purchase Order'}
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}
