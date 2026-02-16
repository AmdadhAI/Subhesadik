/**
 * Sync hardcoded categories to Firestore
 * Run this once to populate the database with the static categories
 * 
 * Usage: node scripts/sync-categories-to-firestore.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Import the hardcoded categories
// Note: This is a workaround since we can't directly import TS in Node
const STATIC_CATEGORIES = [
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

async function syncCategories() {
    try {
        // Initialize Firebase Admin
        if (!admin.apps.length) {
            // Try to use service account from environment or default
            const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
                path.join(__dirname, '../firebase-service-account.json');

            try {
                const serviceAccount = require(serviceAccountPath);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log('✓ Firebase Admin initialized with service account');
            } catch (error) {
                // Fallback to application default credentials
                admin.initializeApp();
                console.log('✓ Firebase Admin initialized with default credentials');
            }
        }

        const db = admin.firestore();
        const categoriesRef = db.collection('categories');

        console.log('🔄 Syncing categories to Firestore...\n');

        for (const category of STATIC_CATEGORIES) {
            const docRef = categoriesRef.doc(category.id);
            const doc = await docRef.get();

            if (doc.exists) {
                console.log(`⚠️  ${category.name} already exists, skipping...`);
            } else {
                await docRef.set({
                    name: category.name,
                    slug: category.slug,
                    imageUrl: category.imageUrl,
                    isActive: category.isActive,
                    order: category.order,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                console.log(`✓ Created: ${category.name} (${category.slug})`);
            }
        }

        console.log('\n✅ Category sync complete!');
        console.log('💡 Refresh your admin panel to see all categories');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error syncing categories:', error);
        console.error('\n💡 Make sure you have:');
        console.error('   1. Firebase service account JSON file');
        console.error('   2. Or GOOGLE_APPLICATION_CREDENTIALS env variable set');
        process.exit(1);
    }
}

syncCategories();
