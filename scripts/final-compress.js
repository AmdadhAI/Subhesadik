const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const categoriesDir = path.join(__dirname, '../public/categories');
const heroDir = path.join(__dirname, '../public/hero');

// Target images flagged by PageSpeed
const imagesToCompress = [
    { dir: categoriesDir, file: 'honey.jpg', maxWidth: 400, quality: 65 },
    { dir: categoriesDir, file: 'local.png', maxWidth: 400, quality: 70 },
    { dir: heroDir, file: 'default-1.webp', maxWidth: 1000, quality: 70 }, // The 354KB hero
];

async function finalCompress() {
    console.log('🎯 Final compression for PageSpeed 95+...\n');

    for (const { dir, file, maxWidth, quality } of imagesToCompress) {
        const inputPath = path.join(dir, file);

        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  ${file} not found, skipping...`);
            continue;
        }

        const beforeStat = fs.statSync(inputPath);
        const beforeSize = (beforeStat.size / 1024).toFixed(2);

        try {
            const ext = path.extname(file).toLowerCase();
            const isWebP = ext === '.webp';
            const isPNG = ext === '.png';

            let pipeline = sharp(inputPath).resize(maxWidth, null, {
                withoutEnlargement: true,
                fit: 'inside'
            });

            // Apply format-specific compression
            if (isWebP) {
                pipeline = pipeline.webp({ quality, effort: 6 });
            } else if (isPNG) {
                pipeline = pipeline.png({ quality, compressionLevel: 9 });
            } else {
                pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
            }

            await pipeline.toFile(inputPath + '.tmp');

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

    console.log('✅ Final compression complete! Target: 95+ score');
}

finalCompress().catch(console.error);
