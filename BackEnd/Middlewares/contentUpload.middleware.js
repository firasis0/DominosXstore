import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.resolve(
    process.cwd(),
    "uploads",
    "content"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (_req, file, cb) => {
        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const baseName = path
            .basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9-_]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .toLowerCase();

        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}`;

        cb(
            null,
            `${baseName || "content-image"}-${uniqueName}${extension}`
        );
    },
});

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
];

const fileFilter = (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
            new Error(
                "Only JPG, PNG, WEBP, GIF and AVIF images are allowed."
            )
        );
    }

    cb(null, true);
};

const contentUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export default contentUpload;