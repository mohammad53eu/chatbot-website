import { Request, Response } from "express";
import { Message } from "../types/chat.types";
import { getConversation } from "../database/queries/conversationQueries";
import { addMessage, deleteMessage, getConversationMessages, updateMessageStatus } from "../database/queries/messageQueries";
import { countTokensForString } from "../utils/tokenCounter";
import { TiktokenModel } from "js-tiktoken";
import { getProviderInstance } from "../services/providers";
import { streamText } from "ai";

export async function sendMessage(req: Request, res: Response): Promise<void> {
  
  let savedUserMessage: Message | null = null;
  const { id: conversation_id } = req.params;

  try {
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(400).json({ success: false, error: "User not authenticated" });
      return;
    }

    const { content, model_provider, model_name } = req.body;

    if (!content || typeof content !== "string") {
      res
        .status(400)
        .json({ success: false, error: "Message content required" });
      return;
    }

    // 1. Validate conversation ownership
    const convo = await getConversation(user_id, conversation_id);
    if (!convo) {
      res.status(404).json({ success: false, error: "Conversation not found" });
      return;
    }

    // 2. Load conversation history
    const history = await getConversationMessages(conversation_id);

    // Convert DB messages → AI format
    const aiMessages = [
      ...history.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      {
        role: "user" as const,
        content,
      },
    ];

    // 3. Count tokens for user message
    const userTokens = countTokensForString(model_name as TiktokenModel, content);

    // Save user message
    savedUserMessage = await addMessage(
      conversation_id,
      "user",
      content,
      userTokens,
      null,
      null,
      "pending",
      null
);


    // 4. Get provider instance
    const provider = await getProviderInstance(user_id, model_provider);

    // 5. Stream assistant response
    const aiStream = streamText({
      model: provider(model_name),
      messages: aiMessages,
    });

    let fullResponse = "";
    let headersSent = false;

    // 6. Stream chunks
    for await (const chunk of aiStream.textStream) {
      // Set headers on first successful chunk
      if (!headersSent) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        headersSent = true;
      }

      console.log("ai response log:", chunk);
      const text = chunk || "";
      fullResponse += text;

      res.write(`data: ${JSON.stringify({ delta: text })}\n\n`);
    }

    // Check if stream had errors
    const finishReason = await aiStream.finishReason;
    if (finishReason === 'error') {
      throw new Error('Stream failed with error');
    }

    // Check if we got any response
    if (!fullResponse) {
      throw new Error('No response received from AI model');
    }

    // 7. Count tokens for assistant response
    const assistantTokens = countTokensForString(model_name as TiktokenModel, fullResponse);

    // Save assistant message after stream finishes
    await addMessage(
      conversation_id,
      "assistant",
      fullResponse,
      assistantTokens,
      model_provider,
      model_name,
     "processed",
     null
    );

    // update the status of the message
    await updateMessageStatus(savedUserMessage.id, "processed", null);

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error)  {
    console.error("POST /conversations/:id/messages error:", error);


    if (savedUserMessage?.id) {
      console.log("saved message::: ",savedUserMessage)
      await deleteMessage( savedUserMessage.id );
    }

    // If streaming didn't start, send JSON error
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Failed to process message",
      });
      return;
    }

    // If streaming started, send error event via SSE
    try {
      res.write(
        `data: ${JSON.stringify({ error: "AI processing failed" })}\n\n`,
      );
      res.end();
    } catch (_) {
      // Response already closed, ignore
    }
  }
}


export async function deleteUserMessage(req: Request, res: Response): Promise<void>{

  try {
    const user_id = req.user?.id;
    const {msgId: message_id} = req.params;

    if(!user_id){
      res.status(400).json({
        success: false,
        error: "user not authenticated"
      })
      return;
    }

    const deletion = await deleteMessage(message_id);

    console.log("deletion status: ", deletion);

    res.status(200).json({
      success: true,
      message: "message deleted successfully"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "couldn't delete the message, try again"
    })
  }
}