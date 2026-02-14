'use client'

import type { UseFormReturn } from 'react-hook-form'
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from '@/components/ui/card'
import { SlidersHorizontal } from 'lucide-react'

interface SectionProps {
  form: UseFormReturn<any>;
}

export function AdvancedSection({ form }: SectionProps) {
    return (
        <AccordionItem value="advanced-system">
        <AccordionTrigger>
            <div className="flex items-center gap-3 text-left">
                <div className="bg-muted p-2 rounded-lg">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">Advanced / System</h3>
                    <p className="text-sm text-muted-foreground">System-level toggles and experimental features.</p>
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <Card className="border-none">
            <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center py-8">
                    No advanced settings are available at this time.
                </p>
            </CardContent>
            </Card>
        </AccordionContent>
        </AccordionItem>
    )
}
