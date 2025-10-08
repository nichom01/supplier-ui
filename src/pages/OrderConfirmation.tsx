import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { SalesOrderWithLines, Customer, Product } from '@/types'
import { salesOrdersApi, customersApi, productsApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Package, Calendar, Truck, CreditCard, MapPin } from 'lucide-react'
import { formatCurrency, getProductImageUrl } from '@/lib/utils'

export default function OrderConfirmation() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [order, setOrder] = useState<SalesOrderWithLines | null>(null)
    const [customer, setCustomer] = useState<Customer | null>(null)
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
            const orderData = await salesOrdersApi.getById(orderId)
            setOrder(orderData)

            // Load customer details
            const customersData = await customersApi.getAll()
            const customerData = customersData.find(
                (c: Customer) => c.customer_id === orderData.customer_id
            )
            setCustomer(customerData || null)

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
            setError(err instanceof Error ? err.message : 'Failed to load order details')
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
            case 'shipped':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading order details...</div>
    }

    if (error || !order) {
        return (
            <div className="space-y-4">
                <div className="text-red-500">Error: {error || 'Order not found'}</div>
                <Button onClick={() => navigate('/products')}>
                    Continue Shopping
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Success Message */}
            <Card className="border-green-200 dark:border-green-900">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                        <div>
                            <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
                            <p className="text-muted-foreground">
                                Thank you for your order. Order #{order.sales_order_id}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Order Details</CardTitle>
                                    <CardDescription>Order #{order.sales_order_id}</CardDescription>
                                </div>
                                <span className={`px-3 py-1 rounded text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Order Date</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(order.order_date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Expected Delivery</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(order.requested_delivery_date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Shipping Method</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.shipping_method}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Payment Terms</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.payment_terms}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer & Shipping */}
                    {customer && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer & Shipping Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium mb-2">Customer</h3>
                                    <div className="text-sm space-y-1">
                                        <p className="font-medium">{customer.name}</p>
                                        <p className="text-muted-foreground">{customer.contact_person}</p>
                                        <p className="text-muted-foreground">{customer.email}</p>
                                        <p className="text-muted-foreground">{customer.phone}</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-medium">Shipping Address</h3>
                                    </div>
                                    <div className="text-sm space-y-1 pl-6">
                                        <p className="font-medium">{customer.shipping_address_name}</p>
                                        <p className="text-muted-foreground">{customer.shipping_address_line1}</p>
                                        {customer.shipping_address_line2 && (
                                            <p className="text-muted-foreground">{customer.shipping_address_line2}</p>
                                        )}
                                        {customer.shipping_address_line3 && (
                                            <p className="text-muted-foreground">{customer.shipping_address_line3}</p>
                                        )}
                                        {customer.shipping_address_line4 && (
                                            <p className="text-muted-foreground">{customer.shipping_address_line4}</p>
                                        )}
                                        {customer.shipping_address_line5 && (
                                            <p className="text-muted-foreground">{customer.shipping_address_line5}</p>
                                        )}
                                        <p className="text-muted-foreground font-medium">
                                            {customer.shipping_address_postcode}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.lines.map(line => {
                                    const product = products.get(line.product_id)
                                    const isHire = line.line_type === 'hire'

                                    return (
                                        <div
                                            key={line.line_id}
                                            className="flex gap-4 items-start py-3 border-b last:border-0"
                                        >
                                            {/* Product Image */}
                                            <div className="w-16 h-16 bg-background rounded-md overflow-hidden flex-shrink-0">
                                                <img
                                                    src={getProductImageUrl(product?.sku)}
                                                    alt={product?.name || 'Product'}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {product?.name || `Product #${line.product_id}`}
                                                </p>
                                                {product?.sku && (
                                                    <p className="text-xs text-muted-foreground">
                                                        SKU: {product.sku}
                                                    </p>
                                                )}
                                                {isHire ? (
                                                    <>
                                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                                                            Hire Period: {line.quantity_ordered} days
                                                        </p>
                                                        {line.hire_start_date && line.hire_end_date && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {formatDate(line.hire_start_date)} - {formatDate(line.hire_end_date)}
                                                            </p>
                                                        )}
                                                        {line.asset_id && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Asset ID: {line.asset_id}
                                                            </p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        Quantity: {line.quantity_ordered}
                                                    </p>
                                                )}
                                                <span className={`text-xs px-2 py-0.5 rounded capitalize inline-block mt-1 ${getStatusColor(line.status)}`}>
                                                    {line.status}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(line.unit_price)} {isHire ? 'per day' : 'each'}
                                                </p>
                                                {(() => {
                                                    const subtotal = line.unit_price * line.quantity_ordered
                                                    let lineTotal = subtotal

                                                    if (line.discount_type && line.discount_value) {
                                                        if (line.discount_type === 'percentage') {
                                                            lineTotal = subtotal * (1 - line.discount_value / 100)
                                                        } else {
                                                            lineTotal = Math.max(0, subtotal - line.discount_value)
                                                        }

                                                        return (
                                                            <>
                                                                <p className="text-xs text-muted-foreground line-through">
                                                                    {formatCurrency(subtotal)}
                                                                </p>
                                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                                    {line.discount_type === 'percentage'
                                                                        ? `${line.discount_value}% off`
                                                                        : `£${line.discount_value} off`}
                                                                </p>
                                                                <p className="font-semibold text-green-600 dark:text-green-400">
                                                                    {formatCurrency(lineTotal)}
                                                                </p>
                                                            </>
                                                        )
                                                    }

                                                    return (
                                                        <p className="font-semibold">
                                                            {formatCurrency(subtotal)}
                                                        </p>
                                                    )
                                                })()}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {(() => {
                                    // Calculate subtotal with line discounts
                                    const subtotal = order.lines.reduce((sum, line) => {
                                        const lineSubtotal = line.unit_price * line.quantity_ordered
                                        let lineTotal = lineSubtotal

                                        if (line.discount_type && line.discount_value) {
                                            if (line.discount_type === 'percentage') {
                                                lineTotal = lineSubtotal * (1 - line.discount_value / 100)
                                            } else {
                                                lineTotal = Math.max(0, lineSubtotal - line.discount_value)
                                            }
                                        }

                                        return sum + lineTotal
                                    }, 0)

                                    const hasOrderDiscount = order.order_discount_type && order.order_discount_value

                                    return (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Subtotal ({order.lines.reduce((sum, line) => sum + line.quantity_ordered, 0)} items)
                                                </span>
                                                <span>{formatCurrency(subtotal)}</span>
                                            </div>

                                            {hasOrderDiscount && (
                                                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                                    <span>
                                                        Order Discount ({order.order_discount_type === 'percentage'
                                                            ? `${order.order_discount_value}%`
                                                            : formatCurrency(order.order_discount_value!)})
                                                    </span>
                                                    <span>
                                                        -{order.order_discount_type === 'percentage'
                                                            ? formatCurrency(subtotal * (order.order_discount_value! / 100))
                                                            : formatCurrency(order.order_discount_value!)}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 space-y-3">
                        <Button className="w-full" onClick={() => navigate('/products')}>
                            Continue Shopping
                        </Button>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => navigate('/orders')}
                        >
                            View All Orders
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
