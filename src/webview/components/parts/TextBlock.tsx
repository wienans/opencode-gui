/* @jsxImportSource solid-js */
import type { MessagePart } from "../../types";

interface TextBlockProps {
  part: MessagePart;
}

export function TextBlock(props: TextBlockProps) {
  if (!props.part.text) return null;
  
  return (
    <div class="message-text">
      {props.part.text}
    </div>
  );
}
