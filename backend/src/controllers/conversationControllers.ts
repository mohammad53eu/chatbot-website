import { Request, Response } from "express";
import {
  addConversation,
  deleteConversation,
  getAllConversations,
  getConversation,
  updateConversationTitle,
} from "../database/queries/conversationQueries.js";
import { getConversationMessages } from "../database/queries/messageQueries.js";
import { getConversationFiles } from "../database/queries/filesQueries.js";
import { AuthenticationError, NotFoundError, DatabaseError } from "../utils/customError.js";


export async function listConversations( req: Request, res: Response ): Promise<void> {

    const user_id = req.user?.id;

    if (!user_id) {
      throw new AuthenticationError();
    }

    const conversations = await getAllConversations(user_id);

    res.json({
      success: true,
      conversations,
    });
}


export async function createConversation( req: Request, res: Response ): Promise<void> {

  const user_id = req.user?.id;
  if (!user_id) {
    throw new AuthenticationError();
  }

  const { settings, system_prompts } = req.body;

  // validate and set defaults for settings
  const max_tokens =
    settings?.max_tokens && Number(settings.max_tokens) > 0
      ? Number(settings.max_tokens)
      : 1000; // default
  const temperature =
    settings?.temperature !== undefined &&
    Number(settings.temperature) >= 0 &&
    Number(settings.temperature) <= 2
      ? Number(settings.temperature)
      : 0.7; // default

  const conversationSettings = { max_tokens, temperature };

  const title = `New Chat`;

  // insert into database
  const conversation = await addConversation(
    user_id,
    title,
    conversationSettings,
    system_prompts || null,
  );

  res.status(201).json({
    success: true,
    conversation,
  });
}


export async function getConversationDetails(req: Request, res: Response) {

  const user_id = req.user?.id;
  const conversation_id = req.params.id;

  if (!user_id) {
    throw new AuthenticationError();
  }

  // get from the database
  const conversation = await getConversation(user_id, conversation_id);

  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  // get the conversation content (messages, files)
  const [messages, files] = await Promise.all([
    getConversationMessages(conversation_id),
    getConversationFiles(user_id, conversation_id),
  ]);

  res.json({
    success: true,
    conversation,
    messages,
    files,
  });
}


export async function renameCoversation(req: Request, res: Response): Promise<void>{

  const user_id = req.user?.id
  const { id: conversation_id } = req.params;

  const { title } = req.body;

  if (!user_id) {
    throw new AuthenticationError();
  }

  //update the name in the database
  const newTitle = await updateConversationTitle(user_id, conversation_id, title);

  if(!newTitle){
    throw new DatabaseError("Failed to update conversation title");
  }

  res.status(200).json({
    success: true,
    data: newTitle
  })
}


export async function deleteUserConversation(req: Request, res: Response): Promise<void>{

  const user_id = req.user?.id;
  const { id: conversation_id } = req.params;

  if (!user_id) {
    throw new AuthenticationError();
  }

  // delete from the database
  const deletion = await deleteConversation(user_id, conversation_id);

  res.status(200).json({
    success: true,
    message: "the conversation deleted successfully"
  })
}