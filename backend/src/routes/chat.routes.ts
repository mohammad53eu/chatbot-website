import { Router } from 'express';

const router = Router();

router.get('/conversations', );   // list user conversations
router.post('/conversations', )   // create a new conversation

router.get('/conversations/:id', )    // get a specific conversation (meta data about it)
router.patch('/conversations/:id', )  // rename a conversation
router.delete('/conversations/:id', )  // delete a conversation

router.get('/conversations/:id/messages', )  // get the messages of a conversation
router.post('/conversations/:id/messages', )  // send a messages
router.delete('/conversations/:id/messages/:msgId', )  // delete a messages


router.post('/completions', ) // this is for testing
export default router;