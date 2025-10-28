/* @jsxImportSource solid-js */
import { Show } from "solid-js";
import type { MessagePart } from "../../types";

interface ToolCallProps {
  part: MessagePart;
}

export function ToolCall(props: ToolCallProps) {
  const { tool, state } = props.part;
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
}
