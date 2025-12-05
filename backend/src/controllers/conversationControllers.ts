import { Request, Response } from "express";
import {
  addConversation,
  getAllConversations,
  getConversation,
} from "../database/queries/conversationQueries";
import {
  addMessage,
  getConversationMessages,
} from "../database/queries/messageQueries";
import { getConversationFiles } from "../database/queries/filesQueries";
import { getProviderInstance } from "../services/providers";
import { generateText, streamText, ModelMessage } from "ai";

export async function listConversations(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(400).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    const conversations = await getAllConversations(user_id);

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("GET /conversations error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversations",
    });
  }
}

export async function createConversation(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      res.status(400).json({ success: false, error: "User not authenticated" });
      return;
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
  } catch (error) {
    console.error("POST /conversations error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create conversation",
    });
  }
}

export async function getConversationDetails(req: Request, res: Response) {
  try {
    const user_id = req.user?.id;
    const conversation_id = req.params.id;

    if (!user_id) {
      res.status(400).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    const conversation = await getConversation(user_id, conversation_id);

    if (!conversation) {
      res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
      return;
    }

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
  } catch (error) {
    console.error("GET /conversations/:id error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversation details",
    });
  }
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  try {
    const user_id = req.user?.id;
    const { id: conversation_id } = req.params;

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

    // 3. Save user message
    const savedUserMessage = await addMessage(
      conversation_id,
      "user",
      content,
      0, //todo: track token count later
      null,
      null,
    );

    // 4. Get provider instance
    const provider = await getProviderInstance(user_id, model_provider);

    // 5. Stream assistant response
    const aiStream = streamText({
      model: provider(model_name),
      messages: aiMessages,
    });

    // Set headers for streaming text
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    // 6. Stream chunks
    for await (const chunk of aiStream.textStream) {
      console.log("ai response log:", chunk);
      const text = chunk || "";
      fullResponse += text;

      res.write(`data: ${JSON.stringify({ delta: text })}\n\n`);
    }

    // 7. Save assistant message after stream finishes
    await addMessage(
      conversation_id,
      "assistant",
      fullResponse,
      0, // (replace with token count later)
      model_provider,
      model_name,
    );

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("POST /conversations/:id/messages error:", error);

    // If streaming started, still send an error event
    try {
      res.write(
        `data: ${JSON.stringify({ error: "AI processing failed" })}\n\n`,
      );
      res.end();
    } catch (_) {}

    // If streaming didn't start:
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Failed to process message",
      });
    }
  }
}
