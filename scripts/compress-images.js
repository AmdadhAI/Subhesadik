const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const categoriesDir = path.join(__dirname, '../public/categories');
const backupDir = path.join(__dirname, '../public/categories-backup');

// Create backup directory
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

async function compressImages() {
    const files = fs.readdirSync(categoriesDir);

    console.log('🖼️  Starting image compression...\n');

    for (const file of files) {
        if (file === '.DS_Store') continue;

        const inputPath = path.join(categoriesDir, file);
        const backupPath = path.join(backupDir, file);
        const stat = fs.statSync(inputPath);

        if (!stat.isFile()) continue;

        try {
            // Backup original
            fs.copyFileSync(inputPath, backupPath);

            const originalSize = (stat.size / 1024).toFixed(2);

            // Compress image
            // - Resize to max width 800px (maintain aspect ratio)
            // - Quality 80%
            // - Progressive JPEG/PNG
            await sharp(inputPath)
                .resize(800, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .jpeg({
                    quality: 80,
                    progressive: true,
                    mozjpeg: true
                })
                .toFile(inputPath + '.tmp');

            // Replace original with compressed
            fs.renameSync(inputPath + '.tmp', inputPath);

            const newStat = fs.statSync(inputPath);
            const newSize = (newStat.size / 1024).toFixed(2);
            const savings = ((1 - newStat.size / stat.size) * 100).toFixed(1);

            console.log(`✓ ${file}`);
            console.log(`  ${originalSize} KB → ${newSize} KB (${savings}% smaller)\n`);

        } catch (error) {
            console.error(`✗ Failed to compress ${file}:`, error.message);
        }
    }

    console.log('✅ Compression complete!');
    console.log(`📦 Originals backed up to: ${backupDir}`);
}

compressImages().catch(console.error);
