/* @jsxImportSource solid-js */
import { For, createEffect, createSignal, onMount, onCleanup, on } from "solid-js";
import type { Message } from "../types";
import { MessageItem } from "./MessageItem";
import { ThinkingIndicator } from "./ThinkingIndicator";

interface MessageListProps {
  messages: Message[];
  isThinking: boolean;
  workspaceRoot?: string;
}

export function MessageList(props: MessageListProps) {
  let containerRef!: HTMLDivElement;
  let endRef!: HTMLDivElement;

  const [shouldAutoScroll, setShouldAutoScroll] = createSignal(true);

  // Check if user is at bottom
  const checkIfAtBottom = () => {
    if (!containerRef) return true;
    const threshold = 50;
    const { scrollTop, scrollHeight, clientHeight } = containerRef;
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // Scroll to bottom
  const scrollToBottom = (smooth = false) => {
    requestAnimationFrame(() => {
      endRef?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    });
  };

  // Handle user scroll
  const handleScroll = () => {
    const atBottom = checkIfAtBottom();
    setShouldAutoScroll(atBottom);
  };

  onMount(() => {
    // Initial scroll
    scrollToBottom(false);

    // Watch for content size changes (streaming text)
    const resizeObserver = new ResizeObserver(() => {
      if (shouldAutoScroll()) {
        scrollToBottom(false);
      }
    });

    containerRef?.addEventListener("scroll", handleScroll, { passive: true });
    
    if (containerRef) {
      resizeObserver.observe(containerRef);
    }

    onCleanup(() => {
      containerRef?.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    });
  });

  // Auto-scroll when messages change
  createEffect(
    on(
      () => props.messages.length,
      () => {
        setShouldAutoScroll(true);
        scrollToBottom(false);
      }
    )
  );

  // Auto-scroll when thinking state changes
  createEffect(
    on(
      () => props.isThinking,
      (thinking) => {
        if (thinking && shouldAutoScroll()) {
          scrollToBottom(false);
        }
      }
    )
  );

  return (
    <div class="messages-container" ref={containerRef!}>
      <For each={props.messages}>
        {(message) => <MessageItem message={message} workspaceRoot={props.workspaceRoot} />}
      </For>

      <ThinkingIndicator when={props.isThinking} />

      <div ref={endRef!} />
    </div>
  );
}
