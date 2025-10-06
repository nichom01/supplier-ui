import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Product } from '@/types'
import { productsApi } from '@/services/api'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function Products() {
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadProducts()
    }, [])

    useEffect(() => {
        filterProducts()
    }, [searchTerm, selectedCategory, products])

    const loadProducts = async () => {
        try {
            setIsLoading(true)
            const data = await productsApi.getAll()
            setProducts(data)
            setFilteredProducts(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products')
        } finally {
            setIsLoading(false)
        }
    }

    const filterProducts = () => {
        let filtered = products

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory)
        }

        setFilteredProducts(filtered)
    }

    const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

    const handleAddToCart = async (productId: number, productName: string) => {
        try {
            await addToCart(productId, 1)
            toast.success('Added to cart', {
                description: `${productName} has been added to your cart`
            })
        } catch (err) {
            console.error('Failed to add to cart:', err)
            toast.error('Failed to add to cart', {
                description: 'Please try again'
            })
        }
    }

    const handleViewProduct = (productId: number) => {
        navigate(`/products/${productId}`)
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading products...</div>
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold">Products</h1>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        {categories.map(category => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(category)}
                                className="capitalize"
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                    <Card key={product.product_id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">{product.name}</CardTitle>
                                    <CardDescription className="text-sm mt-1">
                                        SKU: {product.sku}
                                    </CardDescription>
                                </div>
                                <span className="text-sm px-2 py-1 bg-muted rounded">
                                    {product.category}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground mb-4">
                                {product.description}
                            </p>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Weight:</span> {product.weight}kg</p>
                                <p><span className="font-medium">Volume:</span> {product.volume}m³</p>
                                <p><span className="font-medium">UoM:</span> {product.unit_of_measure}</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center border-t pt-4">
                            <span className="text-2xl font-bold">
                                ${product.price?.toFixed(2) || '0.00'}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewProduct(product.product_id!)}
                                >
                                    View Details
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleAddToCart(product.product_id!, product.name)}
                                >
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Add to Cart
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No products found matching your criteria.
                </div>
            )}
        </div>
    )
}
