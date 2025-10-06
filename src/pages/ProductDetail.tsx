import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Product } from '@/types'
import { productsApi } from '@/services/api'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const [product, setProduct] = useState<Product | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [addingToCart, setAddingToCart] = useState(false)

    useEffect(() => {
        if (id) {
            loadProduct(Number(id))
        }
    }, [id])

    const loadProduct = async (productId: number) => {
        try {
            setIsLoading(true)
            const data = await productsApi.getById(productId)
            setProduct(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load product')
        } finally {
            setIsLoading(false)
        }
    }

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta))
    }

    const handleAddToCart = async () => {
        if (!product?.product_id) return

        try {
            setAddingToCart(true)
            await addToCart(product.product_id, quantity)
            toast.success('Added to cart', {
                description: `${quantity} × ${product.name} added to your cart`
            })
        } catch (err) {
            console.error('Failed to add to cart:', err)
            toast.error('Failed to add to cart', {
                description: 'Please try again'
            })
        } finally {
            setAddingToCart(false)
        }
    }

    const handleBuyNow = async () => {
        if (!product?.product_id) return

        try {
            setAddingToCart(true)
            await addToCart(product.product_id, quantity)
            navigate('/cart')
        } catch (err) {
            console.error('Failed to add to cart:', err)
            setAddingToCart(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading product...</div>
    }

    if (error || !product) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => navigate('/products')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                </Button>
                <div className="text-red-500">Error: {error || 'Product not found'}</div>
            </div>
        )
    }

    const totalPrice = (product.price || 0) * quantity

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate('/products')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image Placeholder */}
                <Card>
                    <CardContent className="p-0">
                        <div className="aspect-square bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-6xl">
                                {product.name.charAt(0)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Product Details */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h1 className="text-4xl font-bold">{product.name}</h1>
                            <span className="text-sm px-3 py-1 bg-muted rounded">
                                {product.category}
                            </span>
                        </div>
                        <p className="text-muted-foreground">SKU: {product.sku}</p>
                    </div>

                    <div className="text-4xl font-bold">
                        ${product.price?.toFixed(2) || '0.00'}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{product.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Specifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="font-medium">Weight:</span>
                                <span>{product.weight} kg</span>

                                <span className="font-medium">Volume:</span>
                                <span>{product.volume} m³</span>

                                <span className="font-medium">Unit of Measure:</span>
                                <span className="capitalize">{product.unit_of_measure}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Add to Cart</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-20 text-center"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleQuantityChange(1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-lg font-semibold">
                                <span>Total:</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button
                                className="flex-1"
                                variant="outline"
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleBuyNow}
                                disabled={addingToCart}
                            >
                                Buy Now
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
