import express from 'express';
import checkAuth, { resetAuth } from '../middelwares/checkAuth.js';
const router = express.Router();

import {
    add,
    verify,
    login,
    sendOtp,
    onBoard,
    addTrophy,
    allTrophies,
    isOnBoarded,
    resetPass,
    resetPassVerify,
} from '../controllers/organizerController.js';

router.route('/').post(add);
router.route('/verify').post(verify);
router.route('/login').post(login);
router.route('/onboard').get(checkAuth, isOnBoarded).post(checkAuth, onBoard);
router.route('/otp').post(sendOtp);
router.route('/resetVerify').post(resetPassVerify);
router.route('/resetPass').post(resetAuth, resetPass);
router.route('/trophy').post(checkAuth, addTrophy);
router.route('/alltrophies').get(checkAuth, allTrophies);

export default router;
