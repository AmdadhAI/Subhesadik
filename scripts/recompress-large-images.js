const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const categoriesDir = path.join(__dirname, '../public/categories');

// Target specific large files
const filesToCompress = ['perfume.jpg', 'panjabi.jpg', 'organic-food.jpg'];

async function recompressImages() {
    console.log('🔧 Re-compressing large category images...\n');

    for (const file of filesToCompress) {
        const inputPath = path.join(categoriesDir, file);

        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  ${file} not found, skipping...`);
            continue;
        }

        const beforeStat = fs.statSync(inputPath);
        const beforeSize = (beforeStat.size / 1024).toFixed(2);

        try {
            // More aggressive compression
            // - Max width 600px (smaller for mobile)
            // - Quality 70% (lower)
            // - More aggressive optimization
            await sharp(inputPath)
                .resize(600, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .jpeg({
                    quality: 70,
                    progressive: true,
                    mozjpeg: true,
                    chromaSubsampling: '4:2:0'
                })
                .toFile(inputPath + '.tmp');

            // Replace original
            fs.renameSync(inputPath + '.tmp', inputPath);

            const afterStat = fs.statSync(inputPath);
            const afterSize = (afterStat.size / 1024).toFixed(2);
            const savings = ((1 - afterStat.size / beforeStat.size) * 100).toFixed(1);

            console.log(`✓ ${file}`);
            console.log(`  ${beforeSize} KB → ${afterSize} KB (${savings}% reduction)\n`);

        } catch (error) {
            console.error(`✗ Failed to compress ${file}:`, error.message);
        }
    }

    console.log('✅ Re-compression complete!');
}

recompressImages().catch(console.error);
