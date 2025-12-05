import { Router } from 'express';
import { createConversation, getConversationDetails, listConversations, sendMessage } from '../controllers/conversationControllers';

const router = Router();

router.get('/conversations', listConversations);  // list user conversations
router.post('/conversations', createConversation)   // create a new conversation

router.get('/conversations/:id', getConversationDetails)    // get a specific conversation 
router.patch('/conversations/:id', )  // rename a conversation
router.delete('/conversations/:id', )  // delete a conversation

router.get('/conversations/:id/messages', )  // get the messages of a conversation
router.post('/conversations/:id/messages', sendMessage)  // send a messages
router.delete('/conversations/:id/messages/:msgId', )  // delete a messages


router.post('/completions', ) // this is for testing
export default router;