# Static Branding Assets

This directory contains build-time static assets that are NOT stored in Firebase.

## Directory Structure

```
/public
├── logo.webp                    # Primary logo (fallback)
├── og-image.webp                # OpenGraph social share image  
├── hero/
│   ├── default-1.webp           # Default hero slide 1
│   ├── default-2.webp           # Default hero slide 2
│   └── default-3.webp           # Default hero slide 3
├── placeholders/
│   ├── product.webp             # Product placeholder image
│   └── category.webp            # Category placeholder image
└── icons/
    └── (SVG icons)
```

## Why /public for These Assets?

✅ **Reduced Firebase Costs**: No Storage egress charges  
✅ **Better LCP**: Bundled with build, loaded from CDN  
✅ **Cache Efficiency**: Versioned with deployment  
✅ **Version Control**: Assets in git repository  

## Firebase Storage Usage

Firebase Storage should ONLY be used for:
- ✅ Product images (uploaded by admin)
- ✅ Admin-uploaded custom hero slides
- ✅ Dynamic marketing banners
- ✅ Category images (uploaded by admin)

## Adding Assets

### Logo
```bash
# Convert to WebP and resize
convert logo.png -resize 500x200 -quality 90 public/logo.webp
```

### Hero Defaults
```bash
# 1920x1080 hero images
convert hero1.jpg -resize 1920x1080^ -gravity center -extent 1920x1080 -quality 82 public/hero/default-1.webp
```

### Placeholders
```bash
# 800x800 product placeholder
convert placeholder.jpg -resize 800x800 -quality 85 public/placeholders/product.webp

# 1200x600 category placeholder  
convert placeholder.jpg -resize 1200x600^ -gravity center -extent 1200x600 -quality 85 public/placeholders/category.webp
```

## Component Usage

Components automatically use fallbacks from /public:

```tsx
// Logo fallback
<Image src="/logo.webp" alt="Logo" />

// Hero fallback
<Image src="/hero/default-1.webp" alt="Hero" />

// Product placeholder
<Image src="/placeholders/product.webp" alt="Product" />
```
