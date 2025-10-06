import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import NotMatch from './pages/NotMatch'
import Dashboard from './pages/Dashboard'
import Sample from './pages/Sample'
import ProductMaintenance from './pages/ProductMaintenance'
import CustomerMaintenance from './pages/CustomerMaintenance'
import ComingSoon from './pages/ComingSoon'
import Chart from './pages/Chart'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderConfirmation from './pages/OrderConfirmation'

export default function Router() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderConfirmation />} />
                <Route path="pages">
                    <Route path="sample" element={<Sample />} />
                    <Route path="product-maintenance" element={<ProductMaintenance />} />
                    <Route path="customer-maintenance" element={<CustomerMaintenance />} />
                    <Route path="feature" element={<ComingSoon />} />
                    <Route path="chart" element={<Chart />} />
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                </Route>
                <Route path="*" element={<NotMatch />} />
            </Route>
        </Routes>
    )
}
