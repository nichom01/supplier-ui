import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function Sample() {
    return (
        <>
            <PageHeader>
                <PageHeaderHeading>Frequently Asked Questions</PageHeaderHeading>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>FAQ's</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="font-bold">How do I place an order?</AccordionTrigger>
                            <AccordionContent>
                                Browse our product catalog, add items to your cart, and proceed to checkout.
                                You'll need to provide shipping information and payment details to complete your order.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="font-bold">What payment methods do you accept?</AccordionTrigger>
                            <AccordionContent>
                                We accept all major credit cards (Visa, MasterCard, American Express),
                                PayPal, and bank transfers for corporate accounts.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger className="font-bold">How long does shipping take?</AccordionTrigger>
                            <AccordionContent>
                                Standard shipping typically takes 3-5 business days. Express shipping options
                                are available for 1-2 day delivery. International orders may take 7-14 business days.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger className="font-bold">What is your return policy?</AccordionTrigger>
                            <AccordionContent>
                                We offer a 30-day return policy for most items. Products must be in original
                                condition with all packaging. Refunds are processed within 5-7 business days
                                after we receive the returned item.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger className="font-bold">Do you offer bulk discounts?</AccordionTrigger>
                            <AccordionContent>
                                Yes! We offer special pricing for bulk orders and corporate accounts.
                                Contact our sales team for a custom quote on orders over 50 units.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </>
    )
}
