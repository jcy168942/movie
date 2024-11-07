import express from 'express';
import crwlMovie from '../services/crwl/crwlMovieService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    var queryParams = req.query;

    await crwlMovie(queryParams, function (err, result) {
        if (err) {
            res.send(500, 'server Error');
            return;
        }

        res.status(200).json(result);
    });
});

export default router;
