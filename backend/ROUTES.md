# API Routes Documentation

This document describes all implemented API endpoints for the chatbot backend. All routes are prefixed with the API base path.

## Base URL
```
http://localhost:<PORT>/api
```

## Authentication
Most routes require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Routes marked with 🔒 require authentication.

---

## Authentication Routes (`/auth`)

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": null
    },
    "token": "jwt-token-string"
  }
}
```

**Error Responses:**
- `400` - Missing required fields or validation failed
- `409` - Email already registered or username already taken
- `500` - Server error

**Validation Rules:**
- Email must be valid format
- Username must be alphanumeric (3-20 characters)
- Password must meet security requirements

---

### Login
**POST** `/auth/login`

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": "/path/to/avatar.jpg"
    },
    "token": "jwt-token-string"
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

---

## Chat Routes (`/chat`) 🔒

All chat routes require authentication.

### List Conversations
**GET** `/chat/conversations`

Get all conversations for the authenticated user.

**Request:** No body required

**Success Response (200):**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "New Chat",
      "system_prompts": null,
      "settings": {
        "max_tokens": 1000,
        "temperature": 0.7
      },
      "created_at": "2025-12-07T10:30:00.000Z",
      "updated_at": "2025-12-07T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `400` - User not authenticated
- `500` - Server error

---

### Create Conversation
**POST** `/chat/conversations`

Create a new conversation.

**Request Body:**
```json
{
  "settings": {
    "max_tokens": 1000,
    "temperature": 0.7
  },
  "system_prompts": "You are a helpful assistant"
}
```

**Notes:**
- All fields are optional
- `max_tokens`: Default is 1000, must be > 0
- `temperature`: Default is 0.7, must be between 0 and 2
- `system_prompts`: Optional system message for the conversation

**Success Response (201):**
```json
{
  "success": true,
  "conversation": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "New Chat",
    "system_prompts": "You are a helpful assistant",
    "settings": {
      "max_tokens": 1000,
      "temperature": 0.7
    },
    "created_at": "2025-12-07T10:30:00.000Z",
    "updated_at": "2025-12-07T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - User not authenticated
- `500` - Server error

---

### Get Conversation Details
**GET** `/chat/conversations/:id`

Get a specific conversation with its messages and files.

**URL Parameters:**
- `id`: Conversation UUID

**Request:** No body required

**Success Response (200):**
```json
{
  "success": true,
  "conversation": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "New Chat",
    "system_prompts": null,
    "settings": {
      "max_tokens": 1000,
      "temperature": 0.7
    },
    "created_at": "2025-12-07T10:30:00.000Z",
    "updated_at": "2025-12-07T10:30:00.000Z"
  },
  "messages": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "role": "user",
      "content": "Hello, how are you?",
      "token_count": 0,
      "model_provider": null,
      "model_used": null,
      "status": "processed",
      "error": null,
      "created_at": "2025-12-07T10:31:00.000Z"
    },
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "role": "assistant",
      "content": "I'm doing well, thank you!",
      "token_count": 0,
      "model_provider": "openai",
      "model_used": "gpt-4",
      "status": "processed",
      "error": null,
      "created_at": "2025-12-07T10:31:05.000Z"
    }
  ],
  "files": []
}
```

**Error Responses:**
- `400` - User not authenticated
- `404` - Conversation not found
- `500` - Server error

---

### Send Message
**POST** `/chat/conversations/:id/messages`

Send a message in a conversation and receive a streaming response.

**URL Parameters:**
- `id`: Conversation UUID

**Request Body:**
```json
{
  "content": "What is the capital of France?",
  "model_provider": "openai",
  "model_name": "gpt-4"
}
```

**Success Response (200):**

This endpoint returns a **Server-Sent Events (SSE)** stream.

**Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Stream Format:**
```
data: {"delta": "The"}

data: {"delta": " capital"}

data: {"delta": " of"}

data: {"delta": " France"}

data: {"delta": " is"}

data: {"delta": " Paris"}

data: {"delta": "."}

data: {"done": true}
```

**Error Stream:**
```
data: {"error": "AI processing failed"}
```

**Notes:**
- User message is saved with status `pending`, then updated to `processed` after completion
- Assistant message is saved after the full response is received
- If an error occurs, the user message is deleted
- Parse SSE events on the client side to build the complete response

**Error Responses:**
- `400` - Missing content, invalid format, or user not authenticated
- `404` - Conversation not found
- `500` - Server error or AI processing failed

---

## Provider Routes (`/provider`) 🔒

All provider routes require authentication.

### Get Provider Config
**GET** `/provider/config`

Get the configuration for a specific AI provider.

**Request Body:**
```json
{
  "provider": "openai"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "provider": "openai",
    "url": "https://api.openai.com/v1",
    "hasKey": true
  }
}
```

**Notes:**
- `hasKey`: Boolean indicating if an API key is configured (actual key is not returned)

**Error Responses:**
- `400` - Missing user_id or provider, or no config exists for this provider
- `500` - Server error

---

### Add/Update Provider Config
**POST** `/provider/upsert`

Add or update provider configuration (API key, base URL, etc.).

**Request Body:**
```json
{
  "provider": "openai",
  "api_key": "sk-proj-...",
  "base_url": "https://api.openai.com/v1",
  "is_default": true
}
```

**Notes:**
- `api_key`: Optional. If provided, it will be encrypted before storage. Send empty string or null to skip updating the key
- `base_url`: Optional. Custom base URL for the provider API
- `is_default`: Optional. Set this provider as default (defaults to false)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "provider": "openai",
    "base_url": "https://api.openai.com/v1",
    "hasKey": true,
    "created": "2025-12-07T10:30:00.000Z",
    "updated": "2025-12-07T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing user_id or provider
- `500` - Server error

---

### List Provider Models
**GET** `/provider/:provider/models`

Get all available models for a specific provider (both built-in and user-added).

**URL Parameters:**
- `provider`: Provider name (e.g., "openai", "anthropic", "google")

**Request:** No body required

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": null,
      "user_id": null,
      "provider": "openai",
      "model_name": "gpt-4",
      "display_name": "GPT-4",
      "supports_vision": false,
      "supports_streaming": true,
      "supports_tools": true,
      "url": null,
      "max_tokens": 8192,
      "is_active": true,
      "source": "builtin"
    },
    {
      "id": "uuid",
      "user_id": "uuid",
      "provider": "openai",
      "model_name": "custom-model",
      "display_name": "My Custom Model",
      "supports_vision": true,
      "supports_streaming": true,
      "supports_tools": false,
      "url": "https://custom-endpoint.com/v1",
      "max_tokens": 4096,
      "is_active": true,
      "source": "user"
    }
  ]
}
```

**Notes:**
- `source`: "builtin" for predefined models, "user" for user-added models
- Built-in models have `id` and `user_id` as null
- Results are merged: user models override built-in models with the same name

**Error Responses:**
- `400` - Missing or invalid provider
- `500` - Server error

---

### Add Provider Model
**POST** `/provider/:provider/models`

Add a custom model for a specific provider.

**URL Parameters:**
- `provider`: Provider name (e.g., "openai", "anthropic")

**Request Body:**
```json
{
  "model_name": "custom-gpt-4",
  "display_name": "Custom GPT-4",
  "supports_vision": true,
  "supports_streaming": true,
  "supports_tools": true,
  "url": "https://custom-endpoint.com/v1",
  "max_tokens": 8192
}
```

**Required Fields:**
- `model_name`: Unique identifier for the model
- `display_name`: Human-readable name

**Optional Fields:**
- `supports_vision`: Default false
- `supports_streaming`: Default true
- `supports_tools`: Default true
- `url`: Custom endpoint URL
- `max_tokens`: Maximum token limit

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "provider": "openai",
    "model_name": "custom-gpt-4",
    "display_name": "Custom GPT-4",
    "supports_vision": true,
    "supports_streaming": true,
    "supports_tools": true,
    "url": "https://custom-endpoint.com/v1",
    "max_tokens": 8192,
    "is_active": true,
    "source": "user"
  }
}
```

**Error Responses:**
- `400` - Missing required fields or user not authenticated
- `409` - Model with this name already exists for this provider
- `500` - Server error

---

### Delete Provider Model
**DELETE** `/provider/:provider/models/:modelId`

Delete a user-added model.

**URL Parameters:**
- `provider`: Provider name
- `modelId`: Model UUID

**Request:** No body required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Model deleted successfully"
}
```

**Notes:**
- Only user-added models can be deleted (built-in models cannot be removed)
- Users can only delete their own models

**Error Responses:**
- `400` - Missing modelId or user not authenticated
- `404` - Model not found or not owned by user
- `500` - Server error

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "message": "Description of the error"
  }
}
```

Or simplified:
```json
{
  "success": false,
  "error": "Error message string"
}
```

---

## Data Types Reference

### Conversation
```typescript
{
  id: string;                    // UUID
  user_id: string;               // UUID
  title: string;                 // Conversation title
  system_prompts?: string | null; // System message
  settings: {                    // Model settings
    max_tokens: number;
    temperature: number;
  };
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
}
```

### Message
```typescript
{
  id: string;                    // UUID
  conversation_id: string;       // UUID
  role: "user" | "assistant";    // Message sender
  content: string;               // Message text
  token_count: number;           // Token usage
  model_provider?: string | null; // Provider name (assistant only)
  model_used?: string | null;    // Model name (assistant only)
  status: "pending" | "processed"; // Processing status
  error: string | null;          // Error message if failed
  created_at: string;            // ISO 8601 timestamp
}
```

### Model
```typescript
{
  id: string | null;             // UUID (null for built-in)
  user_id: string | null;        // UUID (null for built-in)
  provider: string;              // Provider name
  model_name: string;            // Model identifier
  display_name: string;          // Human-readable name
  supports_vision: boolean;      // Vision capability
  supports_streaming: boolean;   // Streaming support
  supports_tools: boolean;       // Function calling support
  url: string | null;            // Custom endpoint
  max_tokens: number | null;     // Token limit
  is_active: boolean;            // Active status
  source?: "builtin" | "user";   // Model source (in list response)
}
```

---

## Notes for Frontend Developers

1. **Authentication Flow:**
   - Store the JWT token from login/register responses
   - Include token in all subsequent requests requiring authentication
   - Handle token expiration and refresh appropriately

2. **Streaming Messages:**
   - Use EventSource or fetch with streaming support for `/chat/conversations/:id/messages`
   - Parse SSE events to display real-time responses
   - Handle `done` event to know when streaming is complete
   - Handle `error` events for error display

3. **Provider Configuration:**
   - Get provider config before displaying provider settings
   - API keys are encrypted server-side and never returned in responses
   - Check `hasKey` to determine if a key is configured

4. **Model Management:**
   - List models to populate model selection dropdowns
   - User models can override built-in models
   - Only user-added models can be deleted

5. **Error Handling:**
   - All responses include a `success` boolean
   - Check status codes for different error scenarios
   - Display appropriate error messages to users
