'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, getCategories } from '@/lib/firebase-data';
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Search } from 'lucide-react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function HeaderSearch({ setSearching, autoFocus = false }: { setSearching: (isSearching: boolean) => void, autoFocus?: boolean }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(autoFocus);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    async function fetchData() {
      try {
        const [products, categories] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        
        const serializableProducts = products.map(product => ({
            ...product,
            createdAt: product.createdAt.toDate().toISOString(),
        })) as unknown as Product[];
        
        setAllProducts(serializableProducts);
        
        const catMap = new Map<string, string>();
        categories.forEach(cat => catMap.set(cat.slug, cat.name));
        setCategoryMap(catMap);

      } catch (error) {
        console.error("Failed to fetch search data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase().trim();
      const filtered = allProducts.filter(product => {
        const categoryName = categoryMap.get(product.categorySlug)?.toLowerCase() || '';
        return (
          product.name.toLowerCase().includes(lowercasedTerm) ||
          product.slug.toLowerCase().includes(lowercasedTerm) ||
          categoryName.includes(lowercasedTerm)
        );
      }).slice(0, 6);
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm, allProducts, categoryMap]);
  
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleResultClick = () => {
    setSearching(false);
  };

  return (
    <div className="relative w-full max-w-md animate-in fade-in-0 slide-in-from-right-4 duration-300">
      <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {(isFocused && isLoading) && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />}
      </div>
      {searchTerm.trim() && (
        <div className="absolute top-full mt-2 w-full bg-card rounded-md shadow-lg border z-50 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
             <div className="p-4 space-y-3">
                 <Skeleton className="h-16 w-full" />
                 <Skeleton className="h-16 w-full" />
             </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map(product => (
                <li key={product.id}>
                  <Link 
                    href={`/products/${product.slug}`} 
                    onClick={handleResultClick} 
                    className="flex items-center gap-4 p-3 hover:bg-muted transition-colors"
                  >
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="rounded-md object-cover h-12 w-12"
                    />
                    <div className="flex-grow">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-primary font-bold">৳{product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-center text-muted-foreground">No products found for "{searchTerm}".</p>
          )}
        </div>
      )}
    </div>
  );
}
