require('dotenv').config();
const cloudinary = require('../config/cloudinary');

async function migrate() {
    console.log('Starting migration of raw files from "upload" to "authenticated"...');
    try {
        let next_cursor = null;
        do {
            const result = await cloudinary.api.resources({
                resource_type: 'raw',
                type: 'upload',
                max_results: 100,
                next_cursor: next_cursor
            });

            console.log(`Found ${result.resources.length} files to migrate.`);

            for (const file of result.resources) {
                console.log(`Migrating ${file.public_id}...`);
                try {
                    await cloudinary.uploader.rename(file.public_id, file.public_id, {
                        resource_type: 'raw',
                        type: 'upload',
                        to_type: 'authenticated',
                        overwrite: true
                    });
                    console.log(`  -> Done.`);
                } catch (err) {
                    console.error(`  -> Failed: ${err.message}`);
                }
            }
            next_cursor = result.next_cursor;
        } while (next_cursor);

        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration error:', error);
    }
}

migrate();
