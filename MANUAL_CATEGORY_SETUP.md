# Manual Category Creation Instructions

Since the automated script had authentication issues, here's the **easiest manual solution**:

## Option 1: Create in Admin Panel (Recommended - 2 minutes)

Go to your admin panel and create these 4 categories:

### 1. Burkha
- **Name**: Burkha
- **Slug**: `burkha`
- **Image**: Upload from `public/categories/burkha.jpg`
- **Status**: Active
- **Order**: 1

### 2. Sunnah Item  
- **Name**: Sunnah Item
- **Slug**: `sunnah-item`
- **Image**: Upload from `public/categories/sunnah-item.jpg`
- **Status**: Active
- **Order**: 3

### 3. Attor
- **Name**: Attor
- **Slug**: `attor`
- **Image**: Upload from `public/categories/attor.jpg`  
- **Status**: Active
- **Order**: 6

### 4. Local
- **Name**: Local
- **Slug**: `local`
- **Image**: Upload from `public/categories/local.png` ⚠️ (PNG file!)
- **Status**: Active
- **Order**: 8

---

## Option 2: Firebase Console (if admin panel has issues)

1. Go to https://console.firebase.google.com/
2. Select your project
3. Go to Firestore Database
4. Click "categories" collection
5. Add 4 new documents with IDs: `burkha`, `sunnah-item`, `attor`, `local`
6. For each, add fields:
   - `name` (string)
   - `slug` (string) 
   - `imageUrl` (string) - path like `/categories/burkha.jpg`
   - `isActive` (boolean) - true
   - `order` (number)
   - `createdAt` (timestamp) - use server timestamp

---

**After creating them**, refresh your admin panel and they'll appear in the category dropdown when creating products!
