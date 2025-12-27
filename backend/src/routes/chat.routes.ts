import { Router } from 'express';
import { createConversation, deleteUserConversation, getConversationDetails, listConversations, renameCoversation } from '../controllers/conversationControllers.js';
import { deleteUserMessage, sendMessage } from '../controllers/messageContollers.js';

const router = Router();

router.get('/conversations', listConversations);  // list user conversations
router.post('/conversations', createConversation)   // create a new conversation

router.get('/conversations/:id', getConversationDetails)    // get a specific conversation with all its data, messages, etc.
router.patch('/conversations/:id', renameCoversation)  // rename a conversation
router.delete('/conversations/:id', deleteUserConversation )  // delete a conversation

router.post('/conversations/:id/messages', sendMessage)  // send a messages
router.delete('/conversations/:id/messages/:msgId', deleteUserMessage)  // delete a message


export default router;