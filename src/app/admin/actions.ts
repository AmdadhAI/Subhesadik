'use server';

// This file is intentionally left mostly empty.
// The database mutation logic (add, update, delete) that was previously here has been
// moved to the relevant client components in `/src/components/admin/` and `/src/app/admin/`.
// This was necessary because server actions, as they were being used, ran in an
// unauthenticated context, which was correctly being blocked by Firestore security rules.
// By moving the logic to the client, we leverage the existing authenticated Firebase
// session from the logged-in admin user, which satisfies the security rules.
// Revalidation is now handled in the client components via `router.refresh()`.

import { seedDatabase as seedDb } from '@/lib/seed';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { revalidatePath } from 'next/cache';

// The seed action is a special case. We keep it as a server action for simplicity,
// but we must grant it temporary broad permissions. This is not ideal for production
// but is acceptable for a one-time setup action. For a real production app, this
// would be better as a secured Cloud Function or a command-line script.
export async function seedDatabaseAction() {

    function getDb() {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        return getFirestore(app);
    }
    const db = getDb();

    // Temporarily, we assume rules might be open for this specific action,
    // or this action is run by an admin-privileged server environment.
    // The proper fix for client-side permission errors is done in the components.
    return await seedDb(db);
}

/**
 * Server action to revalidate the entire app layout after content updates
 * Uses on-demand revalidation with cache tags instead of time-based ISR
 * This eliminates wasteful Firestore reads (1,440/day → near 0)
 */
export async function revalidateApp() {
    // Revalidate layout (for theme changes in header/footer)
    revalidatePath('/', 'layout');

    // Revalidate homepage content using cache tag (on-demand)
    // This invalidates the unstable_cache wrapper around getContent
    revalidateTag('homepage-content');

    return { success: true };
}
