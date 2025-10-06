import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { PurchaseOrder, Supplier } from '@/types'
import { purchaseOrdersApi, suppliersApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Calendar, Truck, DollarSign } from 'lucide-react'

export default function PurchaseOrders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<PurchaseOrder[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setIsLoading(true)
            const [ordersData, suppliersData] = await Promise.all([
                purchaseOrdersApi.getAll(),
                suppliersApi.getAll()
            ])
            setOrders(ordersData.orders)
            setSuppliers(suppliersData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load purchase orders')
        } finally {
            setIsLoading(false)
        }
    }

    const getSupplierName = (supplierId: number) => {
        return suppliers.find(s => s.supplier_id === supplierId)?.name || 'Unknown Supplier'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
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
        return <div className="flex justify-center items-center h-64">Loading purchase orders...</div>
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Purchase Orders</h1>
                <Button onClick={() => navigate('/purchase-orders/new')}>
                    Create New PO
                </Button>
            </div>

            {orders.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">No purchase orders yet</h2>
                        <p className="text-muted-foreground mb-6">
                            Create your first purchase order to get started
                        </p>
                        <Button onClick={() => navigate('/purchase-orders/new')}>
                            Create Purchase Order
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <Card key={order.po_id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">
                                            PO #{order.po_id}
                                        </CardTitle>
                                        <CardDescription>
                                            Ordered on {formatDate(order.order_date)}
                                        </CardDescription>
                                    </div>
                                    <span className={`px-3 py-1 rounded text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <Truck className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Supplier</p>
                                            <p className="text-sm text-muted-foreground">
                                                {getSupplierName(order.supplier_id)}
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
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Expected Delivery</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(order.delivery_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Order ID</p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.po_id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(`/purchase-orders/${order.po_id}`)}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
