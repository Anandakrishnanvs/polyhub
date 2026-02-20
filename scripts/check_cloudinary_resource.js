require('dotenv').config();
const cloudinary = require('../config/cloudinary');

async function check(publicId, resourceType = 'raw', type = 'authenticated') {
  try {
    const result = await cloudinary.api.resource(publicId, { resource_type: resourceType, type });
    console.log('Resource found:');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Resource not found or API error:', err.message || err);
  }
}

// Usage: node scripts/check_cloudinary_resource.js <folder>/<publicId>
if (require.main === module) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Please provide a public_id to check. Example: node scripts/check_cloudinary_resource.js study_materials/698cc0c0d9b114dbb2a79a22');
    process.exit(1);
  }
  check(arg).then(() => process.exit(0));
}
