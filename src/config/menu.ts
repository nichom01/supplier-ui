import {
    Gauge,
    ShoppingCart,
    Package,
    Settings,
    CircleHelp,
    LucideIcon,
    Home,
    ShoppingBag
} from 'lucide-react'

type MenuItemType = {
    title: string
    url: string
    external?: string
    icon?: LucideIcon
    items?: MenuItemType[]
}
type MenuType = MenuItemType[]

export const mainMenu: MenuType = [
    {
        title: 'Home',
        url: '/home',
        icon: Home
    },
    {
        title: 'Dashboard',
        url: '/',
        icon: Gauge
    },
    {
        title: 'Shop',
        url: '/products',
        icon: ShoppingCart
    },
    {
        title: 'Maintenance',
        url: '/pages',
        icon: Settings,
        items: [
            {
                title: 'Orders',
                url: '/orders',
                icon: Package
            },
            {
                title: 'Purchase Orders',
                url: '/purchase-orders',
                icon: ShoppingBag
            },
            {
                title: 'Product Maintenance',
                url: '/pages/product-maintenance',
            },
            {
                title: 'Customer Maintenance',
                url: '/pages/customer-maintenance',
            },
            {
                title: 'Pricing Maintenance',
                url: '/pages/pricing-maintenance',
            },
            {
                title: 'Supplier Maintenance',
                url: '/pages/supplier-maintenance',
            },
            {
                title: 'Supplier Pricing Maintenance',
                url: '/pages/supplier-pricing-maintenance',
            },
            {
                title: 'Coming Soon',
                url: '/pages/feature',
            },
            {
                title: 'Graph',
                url: '/pages/chart',
            },
        ]
    },
    {
        title: 'Help',
        url: '/pages/sample',
        icon: CircleHelp
    },
]
