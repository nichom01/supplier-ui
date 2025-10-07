import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Percent, PoundSterling, Tag, X } from 'lucide-react'
import { Card } from '@/components/ui/card'

type DiscountControlProps = {
    currentType?: 'percentage' | 'fixed'
    currentValue?: number
    onApply: (type?: 'percentage' | 'fixed', value?: number) => void
    label?: string
}

export default function DiscountControl({
    currentType,
    currentValue,
    onApply,
    label = 'Discount'
}: DiscountControlProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(currentType || 'percentage')
    const [discountValue, setDiscountValue] = useState<string>(currentValue?.toString() || '')

    const handleApply = () => {
        const value = parseFloat(discountValue)
        if (!isNaN(value) && value > 0) {
            onApply(discountType, value)
            setIsOpen(false)
        }
    }

    const handleRemove = () => {
        onApply(undefined, undefined)
        setDiscountValue('')
        setIsOpen(false)
    }

    const hasDiscount = currentType && currentValue

    return (
        <div className="space-y-2">
            {hasDiscount ? (
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded">
                        <Tag className="h-3 w-3" />
                        <span>
                            {currentType === 'percentage' ? `${currentValue}% off` : `£${currentValue} off`}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(!isOpen)}
                        className="h-7 px-2"
                    >
                        Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                        className="h-7 w-7"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-8"
                >
                    <Tag className="h-3 w-3 mr-2" />
                    Add {label}
                </Button>
            )}

            {isOpen && (
                <Card className="p-4 space-y-3">
                    <Label>{label}</Label>
                    <RadioGroup value={discountType} onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentage" id={`percentage-${label}`} />
                            <Label htmlFor={`percentage-${label}`} className="font-normal cursor-pointer flex items-center gap-1">
                                <Percent className="h-3 w-3" />
                                Percentage
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id={`fixed-${label}`} />
                            <Label htmlFor={`fixed-${label}`} className="font-normal cursor-pointer flex items-center gap-1">
                                <PoundSterling className="h-3 w-3" />
                                Fixed Amount
                            </Label>
                        </div>
                    </RadioGroup>

                    <div className="flex gap-2">
                        <Input
                            type="number"
                            min="0"
                            step={discountType === 'percentage' ? '1' : '0.01'}
                            max={discountType === 'percentage' ? '100' : undefined}
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            placeholder={discountType === 'percentage' ? 'e.g., 15' : 'e.g., 10.00'}
                            className="flex-1"
                        />
                        <Button onClick={handleApply} size="sm">
                            Apply
                        </Button>
                        <Button onClick={() => setIsOpen(false)} variant="outline" size="sm">
                            Cancel
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    )
}
