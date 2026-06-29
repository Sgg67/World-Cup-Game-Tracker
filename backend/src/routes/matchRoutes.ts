import { Router } from 'express';
import { getMatchesByDate, getFeaturedMatch, updateMatch } from '../controllers/matchController';

const router = Router();

router.get('/', getMatchesByDate);
router.get('/featured', getFeaturedMatch);
router.patch('/:id', updateMatch);

export default router;
