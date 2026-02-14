'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId, orderBy } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Check } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface CategorySelectorProps {
  selectedCategoryIds: string[];
  onCategoryIdsChange: (ids: string[]) => void;
}

export function CategorySelector({ selectedCategoryIds, onCategoryIdsChange }: CategorySelectorProps) {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const allCategoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'categories'), orderBy('order', 'asc'));
  }, [firestore]);

  const { data: allCategoriesData, isLoading: allCategoriesLoading } = useCollection<Category>(allCategoriesQuery);

  const selectedCategoriesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedCategoryIds?.length) return null;
    return query(collection(firestore, 'categories'), where(documentId(), 'in', selectedCategoryIds.slice(0, 30)));
  }, [firestore, selectedCategoryIds]);
  
  const { data: selectedCategoriesData, isLoading: selectedCategoriesLoading } = useCollection<Category>(selectedCategoriesQuery);

  const handleAddCategory = (categoryId: string) => {
    if (!selectedCategoryIds.includes(categoryId)) {
      onCategoryIdsChange([...selectedCategoryIds, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    onCategoryIdsChange(selectedCategoryIds.filter(id => id !== categoryId));
  };

  const orderedSelectedCategories = useMemo(() => {
      if (!selectedCategoriesData) return [];
      const categoryMap = new Map(selectedCategoriesData.map(c => [c.id, c]));
      return selectedCategoryIds.map(id => categoryMap.get(id)).filter((c): c is Category => !!c);
  }, [selectedCategoryIds, selectedCategoriesData]);

  const availableCategories = useMemo(() => {
    if (!allCategoriesData) return [];
    const lowercasedTerm = searchTerm.toLowerCase();
    return allCategoriesData.filter(c => c.name.toLowerCase().includes(lowercasedTerm));
  }, [allCategoriesData, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Display selected categories */}
      <div className="space-y-2">
        {selectedCategoriesLoading && <Skeleton className="h-12 w-full" />}
        {orderedSelectedCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 p-2 border rounded-md bg-background"
            >
              <Image
                src={category.imageUrl || `https://picsum.photos/seed/${category.slug}/40/40`}
                alt={category.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded object-cover"
              />
              <span className="flex-grow text-sm font-medium truncate">{category.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveCategory(category.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
        ))}
        {selectedCategoryIds.length === 0 && !selectedCategoriesLoading && (
          <p className="text-sm text-center text-muted-foreground py-4">No categories selected.</p>
        )}
      </div>

      <Separator />

      <div className="border rounded-md bg-background">
         <div className="p-2 border-b">
            <Input 
                placeholder="Search categories to add..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
            />
        </div>
        <ScrollArea className="h-72">
            {allCategoriesLoading ? (
                <div className="p-2 space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <div className="p-1">
                    {availableCategories.map(category => {
                        const isSelected = selectedCategoryIds.includes(category.id);
                        return (
                            <button
                                type="button"
                                key={category.id}
                                disabled={isSelected}
                                onClick={() => handleAddCategory(category.id)}
                                className={cn(
                                    "flex items-center w-full text-left gap-2 p-2 rounded-md text-sm",
                                    "hover:bg-accent disabled:opacity-50 disabled:bg-muted/50 disabled:cursor-not-allowed"
                                )}
                            >
                                <Image
                                    src={category.imageUrl || `https://picsum.photos/seed/${category.slug}/32/32`}
                                    alt={category.name}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded object-cover"
                                />
                                <span className="flex-grow truncate">{category.name}</span>
                                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                            </button>
                        )
                    })}
                </div>
            )}
            {availableCategories.length === 0 && !allCategoriesLoading && (
                <p className="p-4 text-center text-sm text-muted-foreground">No categories found.</p>
            )}
        </ScrollArea>
      </div>
    </div>
  );
}
