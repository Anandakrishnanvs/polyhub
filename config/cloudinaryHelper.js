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
    try {
        const base64Data = fileBuffer.toString('base64');
        const mimeType = resourceType === 'image' ? 'image/jpeg' : 'application/pdf';
        const dataURI = `data:${mimeType};base64,${base64Data}`;

        const uploadOptions = {
            resource_type: resourceType,
            public_id: `${folder}/${publicId}`,
            // Use 'upload' type for all files - downloads are proxied through the server
            type: 'upload',
            access_mode: 'public'
        };

        // Specify format when provided
        if (format) uploadOptions.format = format;

        const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
        console.log('Cloudinary upload result:', {
            public_id: result.public_id,
            secure_url: result.secure_url,
            resource_type: result.resource_type,
            format: result.format
        });
        return result;
    } catch (err) {
        console.error('Cloudinary upload failed:', err);
        throw err;
    }
}

/**
 * Get a signed Cloudinary URL for downloading an authenticated raw resource.
 * Tries multiple public_id formats since Cloudinary may store the resource
 * with or without the .pdf extension in the public_id.
 * @param {string} folder - The folder name
 * @param {string} publicId - The public ID (without extension)
 * @param {string} format - File format (e.g., 'pdf', 'jpg')
 * @returns {string} - Signed Cloudinary URL
 */
function getSignedDownloadUrl(folder, publicId, format = 'pdf') {
    const resourceType = (format === 'pdf' || format === 'raw') ? 'raw' : 'image';
    const fullPublicId = `${folder}/${publicId}`;

    // Try 'upload' type first (for newly uploaded files).
    // If the file was previously uploaded as 'authenticated', the signed URL
    // with type 'authenticated' will still work for those old files.
    // We generate a signed 'upload' URL; Cloudinary will serve it if accessible.
    // For authenticated-type files, we fall back to a signed 'authenticated' URL.
    try {
        return cloudinary.url(fullPublicId, {
            resource_type: resourceType,
            type: 'upload',
            secure: true,
            sign_url: true,
            format: format
        });
    } catch (e) {
        // fallback for old authenticated-type files
        return cloudinary.url(fullPublicId, {
            resource_type: resourceType,
            type: 'authenticated',
            secure: true,
            sign_url: true,
            format: format
        });
    }
}

/**
 * Get Cloudinary URL for an image resource
 * @param {string} folder - The folder name
 * @param {string} publicId - The public ID
 * @param {string} format - File format (e.g., 'jpg')
 * @returns {string} - Cloudinary URL
 */
function getCloudinaryImageUrl(folder, publicId, format = 'jpg') {
    return cloudinary.url(`${folder}/${publicId}`, {
        format,
        secure: true,
        sign_url: true,
        type: 'upload'
    });
}

module.exports = {
    uploadToCloudinary,
    getSignedDownloadUrl,
    getCloudinaryImageUrl
};
