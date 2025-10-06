import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Settings } from "lucide-react";
import { Link } from "react-router";

export default function Home() {
    return (
        <>
            <PageHeader>
                <PageHeaderHeading>Welcome to Neversoft</PageHeaderHeading>
            </PageHeader>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Get Started</CardTitle>
                        <CardDescription>
                            Explore our features and manage your business efficiently
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Welcome to your business management platform. Use the navigation menu to access
                            different sections of the application.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <ShoppingCart className="h-8 w-8 mb-2" />
                            <CardTitle>Shop</CardTitle>
                            <CardDescription>Browse our product catalog</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to="/products">
                                <Button className="w-full">View Products</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Package className="h-8 w-8 mb-2" />
                            <CardTitle>Orders</CardTitle>
                            <CardDescription>Manage your orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to="/orders">
                                <Button className="w-full">View Orders</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Settings className="h-8 w-8 mb-2" />
                            <CardTitle>Maintenance</CardTitle>
                            <CardDescription>Configure system settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to="/pages/product-maintenance">
                                <Button className="w-full">Manage Products</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
