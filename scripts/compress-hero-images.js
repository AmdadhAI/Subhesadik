const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const heroDir = path.join(__dirname, '../public/hero');
const backupDir = path.join(__dirname, '../public/hero-backup');

// Create backup directory
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

async function compressHeroImages() {
    const files = fs.readdirSync(heroDir);

    console.log('🖼️  Compressing hero slider images...\n');

    for (const file of files) {
        if (file === '.DS_Store' || !file.endsWith('.webp')) continue;

        const inputPath = path.join(heroDir, file);
        const backupPath = path.join(backupDir, file);
        const stat = fs.statSync(inputPath);

        if (!stat.isFile()) continue;

        try {
            // Backup original
            fs.copyFileSync(inputPath, backupPath);

            const originalSize = (stat.size / 1024).toFixed(2);

            // Aggressive compression for hero images
            // - Max width 1200px (good for hero, responsive)
            // - Quality 75% (balance between file size and visual quality)
            // - WebP format with high compression
            await sharp(inputPath)
                .resize(1200, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .webp({
                    quality: 75,
                    effort: 6 // Higher effort = better compression
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

    console.log('✅ Hero image compression complete!');
    console.log(`📦 Originals backed up to: ${backupDir}`);
}

compressHeroImages().catch(console.error);
