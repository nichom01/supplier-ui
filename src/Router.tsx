import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import NotMatch from './pages/NotMatch'
import Dashboard from './pages/Dashboard'
import Sample from './pages/Sample'
import ProductMaintenance from './pages/ProductMaintenance'
import CustomerMaintenance from './pages/CustomerMaintenance'
import PricingMaintenance from './pages/PricingMaintenance'
import ComingSoon from './pages/ComingSoon'
import Chart from './pages/Chart'
import SignIn from './pages/SignIn'
import Signup from './pages/Signup'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import HireProductDetail from './pages/HireProductDetail'
import Basket from './pages/Basket'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderConfirmation from './pages/OrderConfirmation'

export default function Router() {
    return (
        <Routes>
            {/* Public routes - no authentication required */}
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<Signup />} />

            {/* Protected routes - all require authentication with role-based access */}
            <Route element={<AppLayout />}>
                {/* User routes - accessible by user, employee, admin */}
                <Route path="" element={
                    <ProtectedRoute allowedRoles={['user', 'employee', 'admin']}>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="products" element={
                    <ProtectedRoute allowedRoles={['user', 'employee', 'admin']}>
                        <Products />
                    </ProtectedRoute>
                } />
                <Route path="products/:id" element={
                    <ProtectedRoute allowedRoles={['user', 'employee', 'admin']}>
                        <ProductDetail />
                    </ProtectedRoute>
                } />
                <Route path="hire-products/:id" element={
                    <ProtectedRoute allowedRoles={['user', 'employee', 'admin']}>
                        <HireProductDetail />
                    </ProtectedRoute>
                } />
                <Route path="basket" element={
                    <ProtectedRoute allowedRoles={['user', 'employee', 'admin']}>
                        <Basket />
                    </ProtectedRoute>
                } />
                <Route path="checkout" element={
                    <ProtectedRoute allowedRoles={['user', 'employee', 'admin']}>
                        <Checkout />
                    </ProtectedRoute>
                } />
                <Route path="orders" element={
                    <ProtectedRoute allowedRoles={['user', 'employee', 'admin']}>
                        <Orders />
                    </ProtectedRoute>
                } />
                <Route path="orders/:id" element={
                    <ProtectedRoute allowedRoles={['user', 'employee', 'admin']}>
                        <OrderConfirmation />
                    </ProtectedRoute>
                } />

                {/* Admin and Employee routes */}
                <Route path="pages">
                    <Route path="sample" element={
                        <ProtectedRoute allowedRoles={['employee', 'admin']}>
                            <Sample />
                        </ProtectedRoute>
                    } />
                    <Route path="product-maintenance" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <ProductMaintenance />
                        </ProtectedRoute>
                    } />
                    <Route path="customer-maintenance" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <CustomerMaintenance />
                        </ProtectedRoute>
                    } />
                    <Route path="pricing-maintenance" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <PricingMaintenance />
                        </ProtectedRoute>
                    } />
                    <Route path="feature" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <ComingSoon />
                        </ProtectedRoute>
                    } />
                    <Route path="chart" element={
                        <ProtectedRoute allowedRoles={['employee', 'admin']}>
                            <Chart />
                        </ProtectedRoute>
                    } />
                </Route>

                <Route path="*" element={<NotMatch />} />
            </Route>
        </Routes>
    )
}
