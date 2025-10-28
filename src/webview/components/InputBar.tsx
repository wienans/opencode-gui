/* @jsxImportSource solid-js */
import { createEffect, Show } from "solid-js";
import type { Agent } from "../hooks/useVsCodeBridge";

interface InputBarProps {
  value: string;
  onInput: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  selectedAgent: string | null;
  agents: Agent[];
  onAgentChange: (agentName: string) => void;
}

export function InputBar(props: InputBarProps) {
  let inputRef!: HTMLTextAreaElement;

  const adjustTextareaHeight = () => {
    if (inputRef) {
      inputRef.style.height = "auto";
      inputRef.style.height = `${Math.min(
        inputRef.scrollHeight,
        120
      )}px`;
    }
  };

  createEffect(() => {
    props.value;
    adjustTextareaHeight();
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!props.value.trim() || props.disabled) {
      return;
    }
    props.onSubmit();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const AgentSwitcher = () => {
    const currentAgent = () => {
      const name = props.selectedAgent;
      return props.agents.find(a => a.name === name);
    };
    
    const cycleAgent = () => {
      const agentList = props.agents;
      if (agentList.length === 0) return;
      
      const currentIndex = agentList.findIndex(a => a.name === props.selectedAgent);
      const nextIndex = (currentIndex + 1) % agentList.length;
      props.onAgentChange(agentList[nextIndex].name);
    };
    
    const agentColor = () => currentAgent()?.options?.color;
    
    return (
      <button
        type="button"
        class="agent-switcher-button"
        onClick={cycleAgent}
        aria-label="Switch agent"
        title={currentAgent()?.description || 'Switch agent'}
        style={agentColor() ? { color: agentColor() } : {}}
      >
        {currentAgent()?.name || 'Agent'}
      </button>
    );
  };

  return (
    <form class="input-container" onSubmit={handleSubmit}>
      <textarea
        ref={inputRef!}
        class="prompt-input"
        placeholder=""
        value={props.value}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        disabled={props.disabled}
      />
      <div class="input-buttons">
        <Show when={props.agents.length > 0}>
          <AgentSwitcher />
        </Show>
        <button
          type="submit"
          class="shortcut-button shortcut-button--secondary"
          disabled={props.disabled || !props.value.trim()}
          aria-label="Submit (Cmd+Enter)"
        >
          ⌘⏎
        </button>
      </div>
    </form>
  );
}
