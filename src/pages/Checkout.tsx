import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useBasket } from '@/contexts/BasketContext'
import { Customer } from '@/types'
import { customersApi, salesOrdersApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Package, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function Checkout() {
    const navigate = useNavigate()
    const { basket, refreshBasket } = useBasket()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [shippingMethod, setShippingMethod] = useState('standard')
    const [paymentTerms, setPaymentTerms] = useState('net-30')
    const [requestedDeliveryDate, setRequestedDeliveryDate] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadCustomers()
        // Set default delivery date to 7 days from now
        const defaultDate = new Date()
        defaultDate.setDate(defaultDate.getDate() + 7)
        setRequestedDeliveryDate(defaultDate.toISOString().split('T')[0])
    }, [])

    useEffect(() => {
        if (selectedCustomerId) {
            const customer = customers.find(c => c.customer_id === Number(selectedCustomerId))
            setSelectedCustomer(customer || null)
        } else {
            setSelectedCustomer(null)
        }
    }, [selectedCustomerId, customers])

    const loadCustomers = async () => {
        try {
            const data = await customersApi.getAll()
            setCustomers(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load customers')
        }
    }

    const handlePlaceOrder = async () => {
        if (!selectedCustomerId) {
            setError('Please select a customer')
            return
        }

        if (basket.items.length === 0) {
            setError('Your basket is empty')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const paymentTermsMap: Record<string, string> = {
                'net-30': 'Net 30',
                'net-60': 'Net 60',
                'cod': 'Cash on Delivery',
                'prepaid': 'Prepaid'
            }

            const shippingMethodMap: Record<string, string> = {
                'standard': 'Standard Ground',
                'express': 'Express',
                'overnight': 'Overnight'
            }

            const order = await salesOrdersApi.create({
                customer_id: Number(selectedCustomerId),
                requested_delivery_date: new Date(requestedDeliveryDate).toISOString(),
                payment_terms: paymentTermsMap[paymentTerms],
                shipping_method: shippingMethodMap[shippingMethod],
                warehouse_id: 1 // Default warehouse
            })

            // Refresh basket to clear it
            await refreshBasket()

            // Navigate to confirmation page
            navigate(`/orders/${order.sales_order_id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to place order')
        } finally {
            setIsLoading(false)
        }
    }

    if (basket.items.length === 0) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => navigate('/basket')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Basket
                </Button>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Your basket is empty</h2>
                        <p className="text-muted-foreground mb-6">
                            Add some products before checking out
                        </p>
                        <Button onClick={() => navigate('/products')}>
                            Browse Products
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/basket')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Basket
                </Button>
                <h1 className="text-3xl font-bold">Checkout</h1>
            </div>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Checkout Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                            <CardDescription>Select the customer for this order</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="customer">Customer</Label>
                                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                    <SelectTrigger id="customer">
                                        <SelectValue placeholder="Select a customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(customer => (
                                            <SelectItem
                                                key={customer.customer_id}
                                                value={String(customer.customer_id)}
                                            >
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedCustomer && (
                                <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="font-medium">Contact:</span>
                                        <span>{selectedCustomer.contact_person}</span>

                                        <span className="font-medium">Email:</span>
                                        <span>{selectedCustomer.email}</span>

                                        <span className="font-medium">Phone:</span>
                                        <span>{selectedCustomer.phone}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    {selectedCustomer && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border p-4 bg-muted/50">
                                    <p className="font-medium">{selectedCustomer.shipping_address_name}</p>
                                    <p className="text-sm">{selectedCustomer.shipping_address_line1}</p>
                                    {selectedCustomer.shipping_address_line2 && (
                                        <p className="text-sm">{selectedCustomer.shipping_address_line2}</p>
                                    )}
                                    {selectedCustomer.shipping_address_line3 && (
                                        <p className="text-sm">{selectedCustomer.shipping_address_line3}</p>
                                    )}
                                    {selectedCustomer.shipping_address_line4 && (
                                        <p className="text-sm">{selectedCustomer.shipping_address_line4}</p>
                                    )}
                                    {selectedCustomer.shipping_address_line5 && (
                                        <p className="text-sm">{selectedCustomer.shipping_address_line5}</p>
                                    )}
                                    <p className="text-sm font-medium mt-1">
                                        {selectedCustomer.shipping_address_postcode}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Delivery Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="delivery-date">Requested Delivery Date</Label>
                                <Input
                                    id="delivery-date"
                                    type="date"
                                    value={requestedDeliveryDate}
                                    onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Shipping Method</Label>
                                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="standard" id="standard" />
                                        <Label htmlFor="standard" className="font-normal cursor-pointer flex-1">
                                            Standard Ground (5-7 business days)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="express" id="express" />
                                        <Label htmlFor="express" className="font-normal cursor-pointer flex-1">
                                            Express (2-3 business days)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="overnight" id="overnight" />
                                        <Label htmlFor="overnight" className="font-normal cursor-pointer flex-1">
                                            Overnight (1 business day)
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Terms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={paymentTerms} onValueChange={setPaymentTerms}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="net-30" id="net-30" />
                                    <Label htmlFor="net-30" className="font-normal cursor-pointer flex-1">
                                        Net 30 Days
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="net-60" id="net-60" />
                                    <Label htmlFor="net-60" className="font-normal cursor-pointer flex-1">
                                        Net 60 Days
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cod" id="cod" />
                                    <Label htmlFor="cod" className="font-normal cursor-pointer flex-1">
                                        Cash on Delivery
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="prepaid" id="prepaid" />
                                    <Label htmlFor="prepaid" className="font-normal cursor-pointer flex-1">
                                        Prepaid
                                    </Label>
                                </div>
                            </RadioGroup>
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
                            <div className="space-y-3">
                                {basket.items.map(item => {
                                    const isHire = item.product.product_type === 'hire'
                                    const unitPrice = isHire
                                        ? (item.product.daily_hire_rate || 0)
                                        : (item.product.price || 0)
                                    const lineTotal = unitPrice * item.quantity

                                    return (
                                        <div key={item.product.product_id} className="flex justify-between text-sm gap-2">
                                            <span className="flex-1">
                                                {item.product.name}
                                                {isHire && (
                                                    <span className="text-xs text-blue-600 dark:text-blue-400"> (Hire)</span>
                                                )}
                                                <span className="text-muted-foreground">
                                                    {' '}x{item.quantity}{isHire ? ' days' : ''}
                                                </span>
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(lineTotal)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(basket.total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>TBD</span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span>{formatCurrency(basket.total)}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handlePlaceOrder}
                                disabled={isLoading || !selectedCustomerId}
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                {isLoading ? 'Placing Order...' : 'Place Order'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
