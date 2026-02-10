const cloudinary = require('./cloudinary');

/**
 * Upload a file to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from express-fileupload
 * @param {string} folder - The folder name in Cloudinary (e.g., 'question_papers', 'gallery')
 * @param {string} publicId - The public ID for the file
 * @param {string} resourceType - 'image' or 'raw' (for PDFs)
 * @param {string} format - File format (e.g., 'pdf', 'jpg')
 * @returns {Promise} - Cloudinary upload result
 */
async function uploadToCloudinary(fileBuffer, folder, publicId, resourceType = 'raw', format = 'pdf') {
    const base64Data = fileBuffer.toString('base64');
    const dataURI = resourceType === 'image'
        ? `data:image/jpeg;base64,${base64Data}`
        : `data:application/pdf;base64,${base64Data}`;

    return await cloudinary.uploader.upload(dataURI, {
        resource_type: resourceType,
        public_id: `${folder}/${publicId}`,
        format: format
    });
}

/**
 * Get Cloudinary URL for a resource
 * @param {string} folder - The folder name
 * @param {string} publicId - The public ID
 * @param {string} resourceType - 'image' or 'raw'
 * @param {string} format - File format
 * @returns {string} - Cloudinary URL
 */
function getCloudinaryUrl(folder, publicId, resourceType = 'raw', format = 'pdf') {
    if (resourceType === 'image') {
        return cloudinary.url(`${folder}/${publicId}`, { format });
    } else {
        return cloudinary.url(`${folder}/${publicId}`, { resource_type: 'raw', format });
    }
}

module.exports = {
    uploadToCloudinary,
    getCloudinaryUrl
};
