import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Product, Asset, AssetAvailability } from '@/types'
import { productsApi } from '@/services/api'
import { assetsApi } from '@/services/api/assets'
import { useBasket } from '@/contexts/BasketContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ShoppingCart, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, differenceInDays, addDays, addMonths, parseISO } from 'date-fns'
import 'react-day-picker/dist/style.css'

export default function HireProductDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { addToBasket } = useBasket()
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [allAssets, setAllAssets] = useState<Asset[]>([])
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
    const [assetAvailability, setAssetAvailability] = useState<AssetAvailability[]>([])
    const [loadingAvailability, setLoadingAvailability] = useState(false)
    const [addingToBasket, setAddingToBasket] = useState(false)

    useEffect(() => {
        if (id) {
            loadProduct(Number(id))
        }
    }, [id])

    useEffect(() => {
        if (product?.product_id) {
            loadAllAssets(product.product_id)
        }
    }, [product])

    useEffect(() => {
        if (selectedAsset?.asset_id) {
            loadAssetAvailability(selectedAsset.asset_id)
        } else {
            setAssetAvailability([])
            setDateRange(undefined)
        }
    }, [selectedAsset])

    const loadProduct = async (productId: number) => {
        try {
            setIsLoading(true)
            const data = await productsApi.getById(productId)

            if (data.product_type !== 'hire') {
                setError('This product is not available for hire')
                return
            }

            setProduct(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load product')
        } finally {
            setIsLoading(false)
        }
    }

    const loadAllAssets = async (productId: number) => {
        try {
            const assets = await assetsApi.getByProductId(productId)
            setAllAssets(assets)
            // Auto-select first available asset
            const firstAvailable = assets.find(a => a.status === 'available')
            if (firstAvailable) {
                setSelectedAsset(firstAvailable)
            }
        } catch (err) {
            console.error('Failed to load assets:', err)
        }
    }

    const loadAssetAvailability = async (assetId: number) => {
        try {
            setLoadingAvailability(true)
            const startDate = format(new Date(), 'yyyy-MM-dd')
            const endDate = format(addMonths(new Date(), 3), 'yyyy-MM-dd')

            const availability = await assetsApi.getAssetAvailability(
                assetId,
                startDate,
                endDate
            )
            setAssetAvailability(availability)
        } catch (err) {
            console.error('Failed to load asset availability:', err)
        } finally {
            setLoadingAvailability(false)
        }
    }

    const handleAddToBasket = async () => {
        if (!product?.product_id || !dateRange?.from || !dateRange?.to || !selectedAsset) return

        if (!isDateRangeValid()) {
            toast.error('Invalid date range', {
                description: 'Selected dates include unavailable days'
            })
            return
        }

        try {
            setAddingToBasket(true)
            const days = differenceInDays(dateRange.to, dateRange.from) + 1
            const startDate = format(dateRange.from, 'yyyy-MM-dd')
            const endDate = format(dateRange.to, 'yyyy-MM-dd')

            await addToBasket(product.product_id, days, startDate, endDate, selectedAsset.asset_id)

            toast.success('Added to basket', {
                description: `${product.name} (${selectedAsset.asset_tag}) hired for ${days} days`
            })

            // Reload availability to show newly booked dates
            if (selectedAsset.asset_id) {
                await loadAssetAvailability(selectedAsset.asset_id)
            }
            setDateRange(undefined)
        } catch (err) {
            console.error('Failed to add to basket:', err)
            const errorMsg = err instanceof Error ? err.message : 'Please try again'
            toast.error('Failed to add to basket', {
                description: errorMsg
            })
        } finally {
            setAddingToBasket(false)
        }
    }

    const handleBookNow = async () => {
        if (!product?.product_id || !dateRange?.from || !dateRange?.to || !selectedAsset) return

        if (!isDateRangeValid()) {
            toast.error('Invalid date range', {
                description: 'Selected dates include unavailable days'
            })
            return
        }

        try {
            setAddingToBasket(true)
            const days = differenceInDays(dateRange.to, dateRange.from) + 1
            const startDate = format(dateRange.from, 'yyyy-MM-dd')
            const endDate = format(dateRange.to, 'yyyy-MM-dd')

            await addToBasket(product.product_id, days, startDate, endDate, selectedAsset.asset_id)
            navigate('/basket')
        } catch (err) {
            console.error('Failed to add to basket:', err)
            const errorMsg = err instanceof Error ? err.message : 'Please try again'
            toast.error('Failed to add to basket', {
                description: errorMsg
            })
            setAddingToBasket(false)
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

    const days = dateRange?.from && dateRange?.to
        ? differenceInDays(dateRange.to, dateRange.from) + 1
        : 0
    const totalPrice = (product.daily_hire_rate || 0) * days

    // Create list of unavailable dates for the calendar
    const unavailableDates: Date[] = assetAvailability
        .filter(av => !av.is_available)
        .map(av => parseISO(av.date))

    // Validate selected date range doesn't overlap with unavailable dates
    const isDateRangeValid = () => {
        if (!dateRange?.from || !dateRange?.to) return false

        // Check if any date in the selected range is unavailable
        const start = dateRange.from
        const end = dateRange.to

        for (const unavailableDate of unavailableDates) {
            if (unavailableDate >= start && unavailableDate <= end) {
                return false
            }
        }
        return true
    }

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
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded">
                                    For Hire
                                </span>
                                <span className="text-sm px-3 py-1 bg-muted rounded">
                                    {product.category}
                                </span>
                            </div>
                        </div>
                        <p className="text-muted-foreground">SKU: {product.sku}</p>
                    </div>

                    <div className="text-4xl font-bold">
                        ${product.daily_hire_rate?.toFixed(2) || '0.00'}
                        <span className="text-xl text-muted-foreground"> / day</span>
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
                            <CardTitle>Select Asset</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {allAssets.length > 0 ? (
                                <div className="space-y-2">
                                    {allAssets.map((asset) => (
                                        <div
                                            key={asset.asset_id}
                                            className={`p-3 border rounded cursor-pointer transition-colors ${
                                                selectedAsset?.asset_id === asset.asset_id
                                                    ? 'border-primary bg-primary/5'
                                                    : asset.status === 'available'
                                                    ? 'hover:border-primary/50'
                                                    : 'opacity-50 cursor-not-allowed'
                                            }`}
                                            onClick={() => asset.status === 'available' && setSelectedAsset(asset)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium">{asset.asset_tag}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Condition: {asset.condition}
                                                        {asset.status !== 'available' && ` • ${asset.status}`}
                                                    </div>
                                                </div>
                                                {selectedAsset?.asset_id === asset.asset_id && (
                                                    <div className="text-primary text-sm font-medium">
                                                        Selected
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">Loading assets...</div>
                            )}
                        </CardContent>
                    </Card>

                    {selectedAsset && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    Select Hire Dates for {selectedAsset.asset_tag}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loadingAvailability ? (
                                    <div className="text-sm text-muted-foreground">
                                        Loading availability...
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 border border-gray-300 bg-white rounded"></div>
                                                    <span>Available</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 bg-red-200 rounded"></div>
                                                    <span>Unavailable</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-center">
                                                <DayPicker
                                                    mode="range"
                                                    selected={dateRange}
                                                    onSelect={setDateRange}
                                                    disabled={[
                                                        { before: addDays(new Date(), 1) },
                                                        ...unavailableDates
                                                    ]}
                                                    modifiers={{
                                                        booked: unavailableDates
                                                    }}
                                                    modifiersStyles={{
                                                        booked: {
                                                            backgroundColor: '#fecaca',
                                                            color: '#991b1b',
                                                            fontWeight: 'bold'
                                                        }
                                                    }}
                                                    numberOfMonths={2}
                                                    className="border rounded-md p-3"
                                                />
                                            </div>
                                        </div>

                                        {dateRange?.from && dateRange?.to && (
                                            <div className="space-y-2 pt-2 border-t">
                                                {!isDateRangeValid() ? (
                                                    <div className="text-sm text-red-500 font-medium">
                                                        ⚠️ Selected dates include unavailable days. Please choose different dates.
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between text-sm">
                                                            <span>Start Date:</span>
                                                            <span className="font-medium">{format(dateRange.from, 'PPP')}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span>End Date:</span>
                                                            <span className="font-medium">{format(dateRange.to, 'PPP')}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span>Duration:</span>
                                                            <span className="font-medium">{days} days</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t">
                                                            <span>Total:</span>
                                                            <span>${totalPrice.toFixed(2)}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button
                                    className="flex-1"
                                    variant="outline"
                                    onClick={handleAddToBasket}
                                    disabled={addingToBasket || !dateRange?.from || !dateRange?.to || !selectedAsset || !isDateRangeValid()}
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add to Basket
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleBookNow}
                                    disabled={addingToBasket || !dateRange?.from || !dateRange?.to || !selectedAsset || !isDateRangeValid()}
                                >
                                    Book Now
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
