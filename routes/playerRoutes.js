import express from 'express';
import checkAuth from '../middelwares/checkAuth.js';
import multer from 'multer';
import { addPlayer, getAllPlayer, getAllTeamPlayers, getPlaying11 } from '../controllers/playerController.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    // reject a file

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
});

router.route('/').get(getAllTeamPlayers).post(upload.single('Image'), checkAuth, addPlayer);
router.route('/all').get(checkAuth, getAllPlayer);
router.route('/playing11').get(getPlaying11);

export default router;
