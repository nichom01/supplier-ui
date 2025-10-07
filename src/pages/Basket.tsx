import { useNavigate } from "react-router"
import { useBasket } from '@/contexts/BasketContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { formatCurrency, getProductImageUrl } from '@/lib/utils'
import DiscountControl from '@/components/DiscountControl'

export default function Cart() {
    const navigate = useNavigate()
    const { basket, isLoading, updateQuantity, removeItem, clearBasket, updateLineDiscount, updateOrderDiscount } = useBasket()

    const handleQuantityChange = async (productId: number, newQuantity: number) => {
        try {
            await updateQuantity(productId, newQuantity)
        } catch (err) {
            console.error('Failed to update quantity:', err)
        }
    }

    const handleRemoveItem = async (productId: number) => {
        try {
            await removeItem(productId)
        } catch (err) {
            console.error('Failed to remove item:', err)
        }
    }

    const handleClearCart = async () => {
        if (confirm('Are you sure you want to clear your basket?')) {
            try {
                await clearBasket()
            } catch (err) {
                console.error('Failed to clear cart:', err)
            }
        }
    }

    const handleCheckout = () => {
        navigate('/checkout')
    }

    const calculateLinePrice = (item: typeof basket.items[0]) => {
        const unitPrice = item.product.product_type === 'hire'
            ? (item.product.daily_hire_rate || 0)
            : (item.product.price || 0)
        const subtotal = unitPrice * item.quantity

        if (item.discount_type && item.discount_value) {
            if (item.discount_type === 'percentage') {
                return {
                    original: subtotal,
                    discounted: subtotal * (1 - item.discount_value / 100)
                }
            } else {
                return {
                    original: subtotal,
                    discounted: Math.max(0, subtotal - item.discount_value)
                }
            }
        }

        return { original: subtotal, discounted: subtotal }
    }

    if (isLoading && basket.items.length === 0) {
        return <div className="flex justify-center items-center h-64">Loading basket...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/products')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Continue Shopping
                    </Button>
                    <h1 className="text-3xl font-bold">Shopping Basket</h1>
                </div>
                {basket.items.length > 0 && (
                    <Button variant="destructive" onClick={handleClearCart}>
                        Clear Basket
                    </Button>
                )}
            </div>

            {basket.items.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Your basket is empty</h2>
                        <p className="text-muted-foreground mb-6">
                            Add some products to get started
                        </p>
                        <Button onClick={() => navigate('/products')}>
                            Browse Products
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {basket.items.map(item => (
                            <Card key={item.product.product_id}>
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <div className="w-24 h-24 bg-background rounded overflow-hidden flex-shrink-0">
                                            <img
                                                src={getProductImageUrl(item.product.image)}
                                                alt={item.product.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-lg">
                                                            {item.product.name}
                                                        </h3>
                                                        {item.product.product_type === 'hire' && (
                                                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded">
                                                                Hire
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        SKU: {item.product.sku}
                                                    </p>
                                                    {item.product.product_type === 'hire' ? (
                                                        <>
                                                            {item.hire_start_date && item.hire_end_date && (
                                                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                                                    {new Date(item.hire_start_date).toLocaleDateString()} - {new Date(item.hire_end_date).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                            {item.asset_id && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Asset ID: {item.asset_id}
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-sm px-2 py-0.5 bg-muted rounded inline-block mt-1">
                                                            {item.product.category}
                                                        </span>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveItem(item.product.product_id!)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                {item.product.product_type === 'hire' ? (
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.quantity} days
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item.product.product_id!,
                                                                    item.quantity - 1
                                                                )
                                                            }
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                handleQuantityChange(
                                                                    item.product.product_id!,
                                                                    Math.max(1, parseInt(e.target.value) || 1)
                                                                )
                                                            }
                                                            className="w-16 h-8 text-center"
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item.product.product_id!,
                                                                    item.quantity + 1
                                                                )
                                                            }
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}

                                                <div className="text-right">
                                                    {(() => {
                                                        const { original, discounted } = calculateLinePrice(item)
                                                        const unitPrice = item.product.product_type === 'hire'
                                                            ? item.product.daily_hire_rate
                                                            : item.product.price
                                                        const hasDiscount = original !== discounted

                                                        return (
                                                            <>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {formatCurrency(unitPrice)} {item.product.product_type === 'hire' ? 'per day' : 'each'}
                                                                </div>
                                                                {hasDiscount ? (
                                                                    <>
                                                                        <div className="text-sm text-muted-foreground line-through">
                                                                            {formatCurrency(original)}
                                                                        </div>
                                                                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                                            {formatCurrency(discounted)}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="text-lg font-semibold">
                                                                        {formatCurrency(original)}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Discount Control */}
                                            <div className="mt-2 pt-2 border-t">
                                                <DiscountControl
                                                    currentType={item.discount_type}
                                                    currentValue={item.discount_value}
                                                    onApply={(type, value) => updateLineDiscount(item.product.product_id!, type, value)}
                                                    label="Line Discount"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
                                        const subtotal = basket.items.reduce((sum, item) => {
                                            const { discounted } = calculateLinePrice(item)
                                            return sum + discounted
                                        }, 0)

                                        const hasOrderDiscount = basket.order_discount_type && basket.order_discount_value

                                        // Calculate order discount amount
                                        let orderDiscountAmount = 0
                                        if (hasOrderDiscount) {
                                            if (basket.order_discount_type === 'percentage') {
                                                orderDiscountAmount = subtotal * (basket.order_discount_value! / 100)
                                            } else {
                                                orderDiscountAmount = basket.order_discount_value!
                                            }
                                        }

                                        // Calculate final total
                                        const finalTotal = Math.max(0, subtotal - orderDiscountAmount)

                                        return (
                                            <>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Subtotal ({basket.items.reduce((sum, item) => sum + item.quantity, 0)} items)
                                                    </span>
                                                    <span>{formatCurrency(subtotal)}</span>
                                                </div>

                                                {/* Order Discount Section */}
                                                <div className="py-2">
                                                    <DiscountControl
                                                        currentType={basket.order_discount_type}
                                                        currentValue={basket.order_discount_value}
                                                        onApply={(type, value) => updateOrderDiscount(type, value)}
                                                        label="Order Discount"
                                                    />
                                                </div>

                                                {hasOrderDiscount && (
                                                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                                        <span>
                                                            Order Discount ({basket.order_discount_type === 'percentage'
                                                                ? `${basket.order_discount_value}%`
                                                                : formatCurrency(basket.order_discount_value!)})
                                                        </span>
                                                        <span>
                                                            -{formatCurrency(orderDiscountAmount)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Shipping</span>
                                                    <span>Calculated at checkout</span>
                                                </div>
                                            </>
                                        )
                                    })()}
                                </div>

                                <div className="border-t pt-4">
                                    {(() => {
                                        // Recalculate to ensure consistency
                                        const subtotal = basket.items.reduce((sum, item) => {
                                            const { discounted } = calculateLinePrice(item)
                                            return sum + discounted
                                        }, 0)

                                        let orderDiscountAmount = 0
                                        if (basket.order_discount_type && basket.order_discount_value) {
                                            if (basket.order_discount_type === 'percentage') {
                                                orderDiscountAmount = subtotal * (basket.order_discount_value / 100)
                                            } else {
                                                orderDiscountAmount = basket.order_discount_value
                                            }
                                        }

                                        const finalTotal = Math.max(0, subtotal - orderDiscountAmount)

                                        return (
                                            <div className="flex justify-between text-lg font-semibold">
                                                <span>Total</span>
                                                <span>{formatCurrency(finalTotal)}</span>
                                            </div>
                                        )
                                    })()}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="lg" onClick={handleCheckout}>
                                    Proceed to Checkout
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
