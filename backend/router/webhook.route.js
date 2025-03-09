import express from 'express';
import { Webhook } from '../controller/user.controller.js';


const router = express.Router();

// ✅ Ensure express.raw() is applied before the controller
router.post('/', express.raw({ type: 'application/json' }), Webhook);

export default router;
