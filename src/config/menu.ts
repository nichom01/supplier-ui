import {
    CircleAlert,
    Files,
    Gauge,
    ShoppingCart,
    Package,
    LucideIcon
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
        title: 'Orders',
        url: '/orders',
        icon: Package
    },
    {
        title: 'Pages',
        url: '/pages',
        icon: Files,
        items: [
            {
                title: 'Sample Page',
                url: '/pages/sample',
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
            {
                title: 'Sign In',
                url: '/pages/login',
            },
            {
                title: 'Sign Up',
                url: '/pages/signup',
            },
        ]
    },
    {
        title: 'Error',
        url: '/404',
        icon: CircleAlert,
    },
]
