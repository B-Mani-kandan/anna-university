const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.COULD_KEY,
    api_secret: process.env.COULD_SEC
});

// cloudinary.config({
//     cloud_name: 'dby81kbwb',
//     api_key: '796752814593721',
//     api_secret: 'NuJjqvXUWPfUMSZIRQbv5aD5w8c'
// });

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'anna',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}