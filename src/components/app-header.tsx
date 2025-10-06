import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { mainMenu } from '@/config/menu'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import { useCart } from '@/contexts/CartContext'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ChevronDown, Settings, ShoppingCart } from 'lucide-react'
import { AppLogo } from './app-logo'
import { AppSidebar } from './app-sidebar'
import { Button, buttonVariants } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { appConfig, baseUrl } from '@/config/app'
import GitHub from './icons/github'

export function AppHeader() {
    const location = useLocation()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme()
    const { cart } = useCart()

    const isDarkMode = theme === "dark"
    const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

    const toggleDarkMode = (checked: boolean) => {
        setTheme(checked ? "dark" : "light")
    }

    return (
        <header className="bg-background sticky top-0 z-50 border-b">
            <div className="w-full ~max-w-7xl mx-auto flex items-center gap-2 h-14 px-4 md:px-8">
                <div className='flex items-center gap-2 md:gap-0'>
                    <AppSidebar />
                    <Link to="/">
                        <AppLogo />
                    </Link>
                </div>

                <div className='ml-4 flex-1 flex items-center justify-between'>
                    <div className='flex-1'>
                        <nav className="hidden md:flex gap-1">
                            {mainMenu.map((item, index) => (
                                (item.items && item.items.length > 0) ? (
                                    <DropdownMenu key={index}>
                                        <DropdownMenuTrigger className='focus-visible:outline-none'>
                                            <NavLink
                                                key={index}
                                                to={item.url}
                                                className={({ isActive }) => cn(
                                                    "flex items-center gap-2 overflow-hidden rounded-md p-2.5 text-left text-sm outline-none transition-[width,height,padding] hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>svg]:size-4",
                                                    "h-8 text-sm hover:bg-accent hover:text-accent-foreground",
                                                    isActive ? "text-foreground bg-accent" : "text-foreground/70"
                                                )}>
                                                {item.icon && <item.icon />}
                                                <span className='font-medium'>{item.title}</span>
                                                <ChevronDown className='!size-3 -ml-1' />
                                            </NavLink>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align='start' className='min-w-56'>
                                            {item.items.map((subItem, index) => (
                                                <DropdownMenuItem key={index} asChild>
                                                    <NavLink
                                                        to={subItem.url}
                                                        className={cn(
                                                            'cursor-pointer',
                                                            subItem.url === location.pathname && 'bg-muted'
                                                        )}>
                                                        {subItem.title}
                                                    </NavLink>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <NavLink
                                        key={index}
                                        to={item.url}
                                        className={({ isActive }) => cn(
                                            "flex items-center gap-2 overflow-hidden rounded-md p-2.5 text-left text-sm outline-none transition-[width,height,padding] hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>svg]:size-4",
                                            "h-8 text-sm hover:bg-accent hover:text-accent-foreground",
                                            isActive ? "text-foreground bg-accent" : "text-foreground/70"
                                        )}>
                                        {item.icon && <item.icon />}
                                        <span className='font-medium'>{item.title}</span>
                                    </NavLink>
                                )
                            ))}
                        </nav>
                    </div>
                    <nav className="flex gap-1">
                        <Link to="/cart">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 relative"
                            >
                                <ShoppingCart className="size-4" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                                        {cartItemCount > 9 ? '9+' : cartItemCount}
                                    </span>
                                )}
                                <span className="sr-only">Shopping Cart ({cartItemCount} items)</span>
                            </Button>
                        </Link>
                        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                >
                                    <Settings className="size-4" />
                                    <span className="sr-only">Settings</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Settings</DialogTitle>
                                    <DialogDescription>
                                        Configure your application settings here.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="dark-mode">Dark Mode</Label>
                                            <div className="text-sm text-muted-foreground">
                                                Toggle between light and dark theme
                                            </div>
                                        </div>
                                        <Switch
                                            id="dark-mode"
                                            checked={isDarkMode}
                                            onCheckedChange={toggleDarkMode}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="primary-color">Primary Color</Label>
                                        <Select value={primaryColor} onValueChange={setPrimaryColor}>
                                            <SelectTrigger id="primary-color">
                                                <SelectValue placeholder="Select a color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="red">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full bg-[oklch(0.637_0.237_25.331)]" />
                                                        <span>Red</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="blue">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full bg-[oklch(0.552_0.196_254.604)]" />
                                                        <span>Blue</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="green">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full bg-[oklch(0.548_0.166_158.828)]" />
                                                        <span>Green</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="purple">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full bg-[oklch(0.583_0.197_293.756)]" />
                                                        <span>Purple</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="orange">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full bg-[oklch(0.656_0.197_50.598)]" />
                                                        <span>Orange</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <a
                            href={appConfig.github.url}
                            title={appConfig.github.title}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                                buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                }),
                                "size-8"
                            )}>
                            <GitHub />
                            <span className="sr-only">GitHub</span>
                        </a>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant='ghost'
                                    className='relative h-8 w-8 rounded-full cursor-pointer ml-2'>
                                    <Avatar className='h-8 w-8'>
                                        <AvatarImage src={baseUrl + '/avatars/shadcn.jpg'} alt='shadcn' />
                                        <AvatarFallback className="rounded-lg">SC</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-56' align='end' forceMount>
                                <DropdownMenuLabel className='font-normal'>
                                    <div className='flex flex-col space-y-1'>
                                        <p className='text-sm font-medium leading-none'>shadcn</p>
                                        <p className='text-xs leading-none text-muted-foreground'>
                                            m@example.com
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/pages/login">Log out</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>
                </div>
            </div>
        </header >
    )
}