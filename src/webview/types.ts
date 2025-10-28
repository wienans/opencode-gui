export interface MessagePart {
  id: string;
  type: "text" | "reasoning" | "tool" | "file" | "step-start" | "step-finish";
  text?: string;
  tool?: string;
  state?: ToolState;
  snapshot?: string;
  messageID?: string;
}

export interface ToolState {
  status: "pending" | "running" | "completed" | "error";
  input?: any;
  output?: string;
  error?: string;
  title?: string;
  time?: {
    start: number;
    end?: number;
  };
}

export interface Message {
  id: string;
  type: "user" | "assistant";
  text?: string;
  parts?: MessagePart[];
}

export interface Agent {
  name: string;
  description?: string;
  mode: "subagent" | "primary" | "all";
  builtIn: boolean;
  options?: {
    color?: string;
    [key: string]: unknown;
  };
}

export interface IncomingMessage {
  id: string;
  role?: "user" | "assistant";
  text?: string;
  parts?: MessagePart[];
}

export type HostMessage =
  | { type: "init"; ready: boolean }
  | { type: "agentList"; agents: Agent[] }
  | { type: "thinking"; isThinking: boolean }
  | { type: "part-update"; part: MessagePart & { messageID: string } }
  | { type: "message-update"; message: IncomingMessage }
  | { type: "response"; text?: string; parts?: MessagePart[] }
  | { type: "error"; message: string };

export type WebviewMessage =
  | { type: "ready" }
  | { type: "getAgents" }
  | { type: "sendPrompt"; text: string; agent: string | null };
