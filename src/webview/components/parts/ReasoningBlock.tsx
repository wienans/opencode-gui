/* @jsxImportSource solid-js */
import type { MessagePart } from "../../types";

interface ReasoningBlockProps {
  part: MessagePart;
}

export function ReasoningBlock(props: ReasoningBlockProps) {
  return (
    <details class="reasoning-block" open>
      <summary>
        <span class="thinking-icon"></span>
        <span>Reasoning</span>
      </summary>
      <div class="reasoning-content">{props.part.text}</div>
    </details>
  );
}
