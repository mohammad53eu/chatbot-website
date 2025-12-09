import { Router } from 'express';
import { createConversation, deleteUserConversation, getConversationDetails, listConversations, renameCoversation } from '../controllers/conversationControllers';
import { deleteUserMessage, sendMessage } from '../controllers/messageContollers';

const router = Router();

router.get('/conversations', listConversations);  // list user conversations
router.post('/conversations', createConversation)   // create a new conversation

router.get('/conversations/:id', getConversationDetails)    // get a specific conversation with all its data, messages, etc.
router.patch('/conversations/:id', renameCoversation)  // rename a conversation
router.delete('/conversations/:id', deleteUserConversation )  // delete a conversation

router.get('/conversations/:id/messages', )  // get the messages of a conversation (already handled in GET /conversations/:id but i am leaving this for now)
router.post('/conversations/:id/messages', sendMessage)  // send a messages
router.delete('/conversations/:id/messages/:msgId', deleteUserMessage)  // delete a message


router.post('/completions', ) // this is for testing
export default router;