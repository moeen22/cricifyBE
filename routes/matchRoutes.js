import express from 'express';
import checkAuth from '../middelwares/checkAuth.js';
import {
    addMatch,
    getAllMatches,
    addInning,
    startMatch,
    getMatchDetails,
    scorecard,
    updateScoreCard,
    getScorecard,
    playerOut,
    getInnings,
} from '../controllers/matchController.js';
const router = express.Router();

router.route('/').get(getAllMatches).post(checkAuth, addMatch);
router.route('/details').get(getMatchDetails);
router.route('/inning').get(getInnings).post(checkAuth, addInning);
router.route('/start').post(checkAuth, startMatch);
router.route('/scorecard').get(getScorecard).post(checkAuth, updateScoreCard);
router.route('/scorecard/out').post(checkAuth, playerOut);

export default router;
