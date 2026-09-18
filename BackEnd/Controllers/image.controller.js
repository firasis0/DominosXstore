export const uploadProductImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No images were uploaded",
            });
        }

        const images = req.files.map((file) => ({
            url: `/uploads/products/${file.filename}`,
        }));

        res.status(201).json({
            success: true,
            message: "Images uploaded successfully",
            data: images,
        });
    } catch (error) {
        console.error("Error uploading product images:", error);

        res.status(500).json({
            success: false,
            message: "Server error while uploading images",
        });
    }
};