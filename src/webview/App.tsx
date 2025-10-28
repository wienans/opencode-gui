/* @jsxImportSource solid-js */
import { createSignal, createEffect, For, Show } from "solid-js";
import { ThinkingIndicator } from "./components/ThinkingIndicator";
import { InputBar } from "./components/InputBar";
import { useVsCodeBridge, type MessagePart, type Agent } from "./hooks/useVsCodeBridge";
import { applyPartUpdate, applyMessageUpdate, type Message } from "./utils/messageUtils";

interface ToolState {
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

function App() {
  const [input, setInput] = createSignal("");
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [isThinking, setIsThinking] = createSignal(false);
  const [isReady, setIsReady] = createSignal(false);
  const [agents, setAgents] = createSignal<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = createSignal<string | null>(null);
  
  let messagesEndRef!: HTMLDivElement;

  const hasMessages = () =>
    messages().some((m) => m.type === "user" || m.type === "assistant");

  // Setup VS Code message bridge
  const { send } = useVsCodeBridge({
    onInit: (ready) => {
      setIsReady(ready);
    },

    onAgentList: (agentList) => {
      setAgents(agentList);
      // Select first agent by default if none selected
      if (!selectedAgent() && agentList.length > 0) {
        setSelectedAgent(agentList[0].name);
      }
    },

    onThinking: (thinking) => {
      setIsThinking(thinking);
    },

    onPartUpdate: (part) => {
      console.log('[Webview] part-update received:', {
        partId: part.id,
        partType: part.type,
        messageID: part.messageID,
      });
      
      setMessages((prev) => applyPartUpdate(prev, part));
    },

    onMessageUpdate: (finalMessage) => {
      console.log('[Webview] message-update received:', {
        id: finalMessage.id,
        role: finalMessage.role,
        hasParts: !!(finalMessage.parts && finalMessage.parts.length > 0)
      });
      
      setMessages((prev) => applyMessageUpdate(prev, finalMessage));
    },

    onResponse: (payload) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "assistant" as const,
          text: payload.text,
          parts: payload.parts,
        },
      ]);
    },

    onError: (errorMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "assistant" as const,
          text: `Error: ${errorMessage}`,
        },
      ]);
    },
  });

  // Auto-scroll to bottom when messages change
  createEffect(() => {
    // Access signals to track them
    messages();
    isThinking();
    // Scroll after render
    setTimeout(() => {
      messagesEndRef?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  });

  const handleSubmit = () => {
    send({
      type: "sendPrompt",
      text: input(),
      agent: selectedAgent(),
    });
    setInput("");
  };

  const renderToolPart = (part: MessagePart) => {
    const { tool, state } = part;
    if (!state) return null;

    const statusIcon = {
      pending: "⏳",
      running: "▶️",
      completed: "✅",
      error: "❌",
    }[state.status as string] || "❓";

    const statusLabel = state.title || tool || "Tool";

    return (
      <details
        class="tool-call"
        open={state.status === "running"}
      >
        <summary>
          <span class="tool-icon">{statusIcon}</span>
          <span class="tool-name">{statusLabel}</span>
          <span class="tool-status">{state.status}</span>
        </summary>
        <Show when={state.output || state.error}>
          <pre 
            class="tool-output" 
            style="max-height: 80px; overflow: auto; font-family: monospace;"
          >
            {state.error || state.output}
          </pre>
        </Show>
      </details>
    );
  };

  const renderMessagePart = (part: MessagePart) => {
    switch (part.type) {
      case "text":
        return part.text ? (
          <div class="message-text">
            {part.text}
          </div>
        ) : null;
      case "reasoning":
        return (
          <details class="reasoning-block" open>
            <summary>
              <span class="thinking-icon"></span>
              <span>Reasoning</span>
            </summary>
            <div class="reasoning-content">{part.text}</div>
          </details>
        );
      case "tool":
        return renderToolPart(part);
      case "step-start":
      case "step-finish":
        // Don't render step indicators
        return null;
      default:
        return null;
    }
  };



  return (
    <div class={`app ${hasMessages() ? "app--has-messages" : ""}`}>
      <Show when={!hasMessages()}>
        <InputBar
          value={input()}
          onInput={setInput}
          onSubmit={handleSubmit}
          disabled={!isReady() || isThinking()}
          selectedAgent={selectedAgent()}
          agents={agents()}
          onAgentChange={setSelectedAgent}
        />
      </Show>

      <div class="messages-container">
        <For each={messages()}>{(message) => (
          <div class={`message message--${message.type}`}>
            <div class="message-content">
              <Show when={message.parts} fallback={message.text}>
                <For each={message.parts}>{(part) => renderMessagePart(part)}</For>
              </Show>
            </div>
          </div>
        )}</For>

        <ThinkingIndicator when={isThinking()} />

        <div ref={messagesEndRef!} />
      </div>

      <Show when={hasMessages()}>
        <InputBar
          value={input()}
          onInput={setInput}
          onSubmit={handleSubmit}
          disabled={!isReady() || isThinking()}
          selectedAgent={selectedAgent()}
          agents={agents()}
          onAgentChange={setSelectedAgent}
        />
      </Show>
    </div>
  );
}

export default App;
