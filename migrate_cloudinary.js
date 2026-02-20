// One-time migration script: converts all 'authenticated' raw files to 'upload' type
// This runs once to fix existing PDFs that were uploaded as authenticated.
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function migrateFiles() {
    console.log('Starting migration of authenticated raw files to upload type...\n');

    let totalMigrated = 0;
    let totalFailed = 0;
    let nextCursor = null;

    do {
        const params = { resource_type: 'raw', type: 'authenticated', max_results: 100 };
        if (nextCursor) params.next_cursor = nextCursor;

        const result = await cloudinary.api.resources(params);
        const resources = result.resources || [];
        nextCursor = result.next_cursor;

        console.log(`Found ${resources.length} authenticated resource(s) in this batch...`);

        for (const resource of resources) {
            try {
                console.log(`  Migrating: ${resource.public_id}`);
                // Use explicit to change the delivery type from authenticated to upload
                await cloudinary.uploader.explicit(resource.public_id, {
                    resource_type: 'raw',
                    type: 'authenticated',
                    to_type: 'upload',
                    access_mode: 'public'
                });
                console.log(`  ✓ Migrated: ${resource.public_id}`);
                totalMigrated++;
            } catch (err) {
                console.error(`  ✗ Failed: ${resource.public_id} — ${err.message}`);
                totalFailed++;
            }
        }
    } while (nextCursor);

    console.log(`\nMigration complete!`);
    console.log(`  ✓ Migrated: ${totalMigrated}`);
    console.log(`  ✗ Failed:   ${totalFailed}`);
}

migrateFiles().catch(err => {
    console.error('Migration error:', err.message);
    process.exit(1);
});
