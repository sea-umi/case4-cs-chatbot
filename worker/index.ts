/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import {
  CONVERSATION_STATUS,
  MAX_MESSAGE_LENGTH,
  SAFE_PLACEHOLDER_REPLY,
  createBackendId,
  type MessageRole,
} from "../lib/backend";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface ConversationRow {
  id: string;
  status: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function methodNotAllowed(allow: string): Response {
  return jsonWithHeaders({ error: "method not allowed" }, 405, { Allow: allow });
}

function jsonWithHeaders(data: unknown, status: number, headers: Record<string, string>): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function databaseUnavailable(env: Env): Response | undefined {
  if (!env.DB) {
    return json({ error: "database unavailable" }, 503);
  }
  return undefined;
}

function getConversationId(pathname: string): string | undefined {
  const match = pathname.match(/^\/api\/conversations\/([^/]+)\/messages\/?$/);
  if (!match) return undefined;

  try {
    const id = decodeURIComponent(match[1]);
    return id || undefined;
  } catch {
    return undefined;
  }
}

async function parseMessageContent(request: Request): Promise<string | undefined> {
  try {
    const payload = (await request.json()) as { content?: unknown };
    if (typeof payload.content !== "string") return undefined;

    const content = payload.content.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) return undefined;
    return content;
  } catch {
    return undefined;
  }
}

function toMessage(row: MessageRow) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

async function handleApiRequest(request: Request, env: Env): Promise<Response | undefined> {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    if (request.method !== "GET") return methodNotAllowed("GET");
    return json({ status: "ok" });
  }

  if (url.pathname === "/api/conversations" || url.pathname === "/api/conversations/") {
    if (request.method !== "POST") return methodNotAllowed("POST");

    const unavailable = databaseUnavailable(env);
    if (unavailable) return unavailable;

    const id = createBackendId();
    const status = CONVERSATION_STATUS;
    try {
      await env.DB.prepare(
        "INSERT INTO conversations (id, status) VALUES (?, ?)",
      ).bind(id, status).run();
      return jsonWithHeaders({ id, status }, 201, { Location: `/api/conversations/${id}` });
    } catch (error) {
      console.error("Failed to create conversation", error);
      return json({ error: "could not create conversation" }, 500);
    }
  }

  const conversationId = getConversationId(url.pathname);
  if (!conversationId) return undefined;

  if (request.method === "GET") {
    const unavailable = databaseUnavailable(env);
    if (unavailable) return unavailable;

    try {
      const conversation = await env.DB.prepare(
        "SELECT id, status FROM conversations WHERE id = ?",
      ).bind(conversationId).first<ConversationRow>();
      if (!conversation) return json({ error: "conversation not found" }, 404);

      const result = await env.DB.prepare(
        `SELECT id, conversation_id, role, content, created_at
         FROM messages
         WHERE conversation_id = ?
         ORDER BY created_at ASC, id ASC`,
      ).bind(conversationId).all<MessageRow>();

      return json({ messages: result.results.map(toMessage) });
    } catch (error) {
      console.error("Failed to list conversation messages", error);
      return json({ error: "could not load messages" }, 500);
    }
  }

  if (request.method === "POST") {
    const unavailable = databaseUnavailable(env);
    if (unavailable) return unavailable;

    const content = await parseMessageContent(request);
    if (!content) {
      return json({ error: `content is required and must be ${MAX_MESSAGE_LENGTH} characters or fewer` }, 400);
    }

    try {
      const conversation = await env.DB.prepare(
        "SELECT id, status FROM conversations WHERE id = ?",
      ).bind(conversationId).first<ConversationRow>();
      if (!conversation) return json({ error: "conversation not found" }, 404);

      const customerMessage = {
        id: createBackendId(),
        conversationId,
        role: "customer" as const,
        content,
        createdAt: new Date().toISOString(),
      };
      const assistantMessage = {
        id: createBackendId(),
        conversationId,
        role: "assistant" as const,
        content: SAFE_PLACEHOLDER_REPLY,
        createdAt: new Date().toISOString(),
      };

      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO messages (id, conversation_id, role, content, created_at)
           VALUES (?, ?, ?, ?, ?)`,
        ).bind(
          customerMessage.id,
          customerMessage.conversationId,
          customerMessage.role,
          customerMessage.content,
          customerMessage.createdAt,
        ),
        env.DB.prepare(
          `INSERT INTO messages (id, conversation_id, role, content, created_at)
           VALUES (?, ?, ?, ?, ?)`,
        ).bind(
          assistantMessage.id,
          assistantMessage.conversationId,
          assistantMessage.role,
          assistantMessage.content,
          assistantMessage.createdAt,
        ),
      ]);

      return json({ message: toMessage({
        id: customerMessage.id,
        conversation_id: customerMessage.conversationId,
        role: customerMessage.role,
        content: customerMessage.content,
        created_at: customerMessage.createdAt,
      }), reply: toMessage({
        id: assistantMessage.id,
        conversation_id: assistantMessage.conversationId,
        role: assistantMessage.role,
        content: assistantMessage.content,
        created_at: assistantMessage.createdAt,
      }) }, 201);
    } catch (error) {
      console.error("Failed to save conversation message", error);
      return json({ error: "could not save message" }, 500);
    }
  }

  return methodNotAllowed("GET, POST");
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const apiResponse = await handleApiRequest(request, env);
    if (apiResponse) return apiResponse;

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
