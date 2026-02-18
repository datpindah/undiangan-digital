const express = require('express');
const { createInvitation, getInvitationBySlug, updateInvitation, getMyInvitations, updateCouplePhoto, deleteInvitation } = require('../controllers/invitationController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware'); // Explicitly import uploadImage

const router = express.Router();

router.post('/', authMiddleware, createInvitation);
router.get('/my', authMiddleware, getMyInvitations);
router.get('/:slug', getInvitationBySlug);
router.put('/:id', authMiddleware, updateInvitation);
router.post('/:id/couple-photo', authMiddleware, uploadImage.single('photo'), updateCouplePhoto);
router.delete('/:id', authMiddleware, deleteInvitation);

module.exports = router;
