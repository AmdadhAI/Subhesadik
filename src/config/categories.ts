import type { Category } from "@/lib/types";

export const STATIC_CATEGORIES: Omit<Category, 'createdAt'>[] = [
    {
        id: 'panjabi',
        name: 'Panjabi',
        slug: 'panjabi',
        imageUrl: '/categories/panjabi.jpg',
        isActive: true,
        order: 0
    },
    {
        id: 'burkha',
        name: 'Burkha',
        slug: 'burkha',
        imageUrl: '/categories/burkha.jpg',
        isActive: true,
        order: 1
    },
    {
        id: 'honey',
        name: 'Honey',
        slug: 'honey',
        imageUrl: '/categories/honey.jpg',
        isActive: true,
        order: 2
    },
    {
        id: 'sunnah-item',
        name: 'Sunnah Item',
        slug: 'sunnah-item',
        imageUrl: '/categories/sunnah-item.jpg',
        isActive: true,
        order: 3
    },
    {
        id: 'organic-food',
        name: 'Organic Food',
        slug: 'organic-food',
        imageUrl: '/categories/organic-food.jpg',
        isActive: true,
        order: 4
    },
    {
        id: 'perfume',
        name: 'Perfume',
        slug: 'perfume',
        imageUrl: '/categories/perfume.jpg',
        isActive: true,
        order: 5
    },
    {
        id: 'attor',
        name: 'Attor',
        slug: 'attor',
        imageUrl: '/categories/attor.jpg',
        isActive: true,
        order: 6
    },
    {
        id: 'mix',
        name: 'Mix',
        slug: 'mix',
        imageUrl: '/categories/mix.png',
        isActive: true,
        order: 7
    },
    {
        id: 'local',
        name: 'Local',
        slug: 'local',
        imageUrl: '/categories/local.png',
        isActive: true,
        order: 8
    }
];
