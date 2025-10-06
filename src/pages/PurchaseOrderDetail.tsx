import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { PurchaseOrderWithLines, Product } from '@/types'
import { purchaseOrdersApi, productsApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Package, Calendar, Truck, DollarSign } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function PurchaseOrderDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [order, setOrder] = useState<PurchaseOrderWithLines | null>(null)
    const [products, setProducts] = useState<Map<number, Product>>(new Map())
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (id) {
            loadOrderDetails(Number(id))
        }
    }, [id])

    const loadOrderDetails = async (orderId: number) => {
        try {
            setIsLoading(true)
            const orderData = await purchaseOrdersApi.getById(orderId)
            setOrder(orderData)

            // Load product details for all order lines
            const productMap = new Map<number, Product>()
            for (const line of orderData.lines) {
                try {
                    const product = await productsApi.getById(line.product_id)
                    productMap.set(line.product_id, product)
                } catch (err) {
                    console.error(`Failed to load product ${line.product_id}:`, err)
                }
            }
            setProducts(productMap)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load purchase order details')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'received':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading purchase order details...</div>
    }

    if (error || !order) {
        return (
            <div className="space-y-4">
                <div className="text-red-500">Error: {error || 'Purchase order not found'}</div>
                <Button onClick={() => navigate('/purchase-orders')}>
                    Back to Purchase Orders
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/purchase-orders')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Purchase Order #{order.po_id}</h1>
                    <p className="text-muted-foreground">Ordered on {formatDate(order.order_date)}</p>
                </div>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                </span>
            </div>

            {/* Order Summary */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Supplier Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Supplier</p>
                                <p className="text-lg font-semibold">
                                    {order.supplier_name || `Supplier #${order.supplier_id}`}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Expected Delivery</p>
                                    <p className="text-sm">
                                        {formatDate(order.delivery_date)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Total Amount</p>
                                    <p className="text-lg font-semibold">
                                        £{order.total_amount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                    <CardDescription>{order.lines.length} item(s) ordered</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">Quantity Ordered</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.lines.map(line => {
                                const product = products.get(line.product_id)
                                return (
                                    <TableRow key={line.line_item_id}>
                                        <TableCell className="font-medium">
                                            {product?.name || `Product #${line.product_id}`}
                                        </TableCell>
                                        <TableCell>{product?.sku || '-'}</TableCell>
                                        <TableCell className="text-right">{line.quantity_ordered}</TableCell>
                                        <TableCell className="text-right">
                                            £{line.unit_price.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            £{(line.quantity_ordered * line.unit_price).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(line.status)}`}>
                                                {line.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            <TableRow>
                                <TableCell colSpan={4} className="text-right font-semibold">
                                    Total
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    £{order.total_amount.toFixed(2)}
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate('/purchase-orders')}>
                    Back to Purchase Orders
                </Button>
            </div>
        </div>
    )
}
