'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Check } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface ProductSelectorProps {
  selectedProductIds: string[];
  onProductIdsChange: (ids: string[]) => void;
}

export function ProductSelector({ selectedProductIds, onProductIdsChange }: ProductSelectorProps) {
  const firestore = useFirestore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const allProductsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);

  const { data: allProductsData, isLoading: allProductsLoading } = useCollection<Product>(allProductsQuery);

  const selectedProductsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedProductIds?.length) return null;
    // Firestore 'in' query is limited to 30 items. For this admin UI, we assume we won't exceed that.
    // For larger selections, pagination/batching would be needed here.
    return query(collection(firestore, 'products'), where(documentId(), 'in', selectedProductIds.slice(0, 30)));
  }, [firestore, selectedProductIds]);
  
  const { data: selectedProductsData, isLoading: selectedProductsLoading } = useCollection<Product>(selectedProductsQuery);

  useEffect(() => {
    if (allProductsData) {
      setAllProducts(allProductsData);
    }
  }, [allProductsData]);

  const handleAddProduct = (productId: string) => {
    if (!selectedProductIds.includes(productId)) {
      onProductIdsChange([...selectedProductIds, productId]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    onProductIdsChange(selectedProductIds.filter(id => id !== productId));
  };

  const orderedSelectedProducts = useMemo(() => {
      if (!selectedProductsData) return [];
      const productMap = new Map(selectedProductsData.map(p => [p.id, p]));
      return selectedProductIds.map(id => productMap.get(id)).filter((p): p is Product => !!p);
  }, [selectedProductIds, selectedProductsData]);

  const availableProducts = useMemo(() => {
    if (!allProducts) return [];
    const lowercasedTerm = searchTerm.toLowerCase();
    return allProducts.filter(p => p.name.toLowerCase().includes(lowercasedTerm));
  }, [allProducts, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Display selected products */}
      <div className="space-y-2">
        {selectedProductsLoading && <Skeleton className="h-12 w-full" />}
        {orderedSelectedProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-2 p-2 border rounded-md bg-background"
            >
              <Image
                src={product.images[0]}
                alt={product.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded object-cover"
              />
              <span className="flex-grow text-sm font-medium truncate">{product.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveProduct(product.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
        ))}
        {selectedProductIds.length === 0 && !selectedProductsLoading && (
          <p className="text-sm text-center text-muted-foreground py-4">No products selected.</p>
        )}
      </div>

      <Separator />

      {/* Search and available products list */}
      <div className="border rounded-md bg-background">
         <div className="p-2 border-b">
            <Input 
                placeholder="Search products to add..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
            />
        </div>
        <ScrollArea className="h-72">
            {allProductsLoading ? (
                <div className="p-2 space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <div className="p-1">
                    {availableProducts.map(product => {
                        const isSelected = selectedProductIds.includes(product.id);
                        return (
                            <button
                                type="button"
                                key={product.id}
                                disabled={isSelected}
                                onClick={() => handleAddProduct(product.id)}
                                className={cn(
                                    "flex items-center w-full text-left gap-2 p-2 rounded-md text-sm",
                                    "hover:bg-accent disabled:opacity-50 disabled:bg-muted/50 disabled:cursor-not-allowed"
                                )}
                            >
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded object-cover"
                                />
                                <span className="flex-grow truncate">{product.name}</span>
                                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                            </button>
                        )
                    })}
                </div>
            )}
            {availableProducts.length === 0 && !allProductsLoading && (
                <p className="p-4 text-center text-sm text-muted-foreground">No products found.</p>
            )}
        </ScrollArea>
      </div>
    </div>
  );
}
