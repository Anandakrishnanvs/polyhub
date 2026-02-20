// Quick diagnostic: test what Cloudinary returns for authenticated vs upload type URLs
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const https = require('https');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// First, list resources to get a real public_id
async function main() {
    try {
        console.log('Fetching resource list from Cloudinary...\n');
        const result = await cloudinary.api.resources({
            resource_type: 'raw',
            type: 'authenticated',
            max_results: 3
        });

        if (!result.resources || result.resources.length === 0) {
            console.log('No authenticated raw resources found. Trying upload type...');
            const result2 = await cloudinary.api.resources({
                resource_type: 'raw',
                type: 'upload',
                max_results: 3
            });
            console.log('Upload-type resources:', JSON.stringify(result2.resources.map(r => ({ public_id: r.public_id, type: r.type })), null, 2));
            return;
        }

        console.log('Found authenticated resources:');
        result.resources.forEach(r => console.log(' -', r.public_id, '| type:', r.type, '| format:', r.format));

        // Test the first one
        const testResource = result.resources[0];
        const publicId = testResource.public_id;
        console.log('\nTesting download for public_id:', publicId);

        // Generate upload-type URL
        const uploadUrl = cloudinary.url(publicId, {
            resource_type: 'raw',
            type: 'upload',
            secure: true,
            sign_url: true,
            format: 'pdf'
        });

        // Generate authenticated-type URL
        const authUrl = cloudinary.url(publicId, {
            resource_type: 'raw',
            type: 'authenticated',
            secure: true,
            sign_url: true,
            format: 'pdf'
        });

        console.log('\n--- Testing UPLOAD type URL ---');
        await testUrl(uploadUrl);

        console.log('\n--- Testing AUTHENTICATED type URL ---');
        await testUrl(authUrl);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

function testUrl(url) {
    return new Promise((resolve) => {
        console.log('URL:', url.substring(0, 100) + '...');
        https.get(url, (res) => {
            console.log('Status:', res.statusCode);
            console.log('Content-Type:', res.headers['content-type']);
            console.log('Content-Length:', res.headers['content-length']);
            console.log('Location (redirect):', res.headers['location'] || 'none');

            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                console.log('>> REDIRECTING to:', res.headers.location.substring(0, 100));
                res.resume();
                // Follow the redirect
                https.get(res.headers.location, (res2) => {
                    console.log('After redirect - Status:', res2.statusCode);
                    console.log('After redirect - Content-Type:', res2.headers['content-type']);
                    res2.resume();
                    resolve();
                }).on('error', (e) => { console.error('Redirect error:', e.message); resolve(); });
            } else {
                res.resume();
                resolve();
            }
        }).on('error', (e) => { console.error('Error:', e.message); resolve(); });
    });
}

main();
