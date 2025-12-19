
import { createSignal, Show, For, onMount, onCleanup } from "solid-js";
import type { Agent } from "../types";

interface AgentSwitcherProps {
  agents: Agent[];
  selectedAgent: string | null;
  onAgentChange: (agentName: string) => void;
}

export function AgentSwitcher(props: AgentSwitcherProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [dropdownDirection, setDropdownDirection] = createSignal<'up' | 'down'>('up');
  let triggerRef!: HTMLButtonElement;
  let containerRef!: HTMLDivElement;

  // Filter to only show primary agents in dropdown
  const primaryAgents = () => props.agents.filter(agent => agent.mode === 'primary');

  const currentAgent = () => {
    const name = props.selectedAgent;
    return props.agents.find(a => a.name === name);
  };

  const agentColor = (agent?: Agent) => agent?.options?.color || 'var(--foreground)';

  const checkAvailableSpace = () => {
    if (!triggerRef) return;
    
    const triggerRect = triggerRef.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(primaryAgents().length * 32, 200); // Use filtered count
    
    const spaceAbove = triggerRect.top;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    
    // Default to up, fallback to down if not enough space
    if (spaceAbove < dropdownHeight && spaceBelow > dropdownHeight) {
      setDropdownDirection('down');
    } else {
      setDropdownDirection('up');
    }
  };

  const toggleDropdown = () => {
    if (primaryAgents().length === 0) return;
    
    if (!isOpen()) {
      checkAvailableSpace();
    }
    setIsOpen(!isOpen());
  };

  const handleAgentClick = (agentName: string) => {
    props.onAgentChange(agentName);
    setIsOpen(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (!containerRef?.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      setIsOpen(false);
      triggerRef?.focus();
    }
    
    // Arrow key navigation when dropdown is open
    if (isOpen() && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const options = Array.from(containerRef?.querySelectorAll('.agent-option') || []);
      const currentIndex = options.findIndex((opt) => opt.classList.contains('selected'));
      let nextIndex = currentIndex;
      
      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      }
      
      options.forEach((opt, idx) => {
        const element = opt as HTMLElement;
        if (idx === nextIndex) {
          element.focus();
          element.setAttribute('data-focused', 'true');
        } else {
          element.removeAttribute('data-focused');
        }
      });
    }
    
    // Enter to select focused option
    if (isOpen() && e.key === 'Enter') {
      e.preventDefault();
      const focusedOption = containerRef?.querySelector('.agent-option[data-focused="true"]') as HTMLElement;
      if (focusedOption) {
        const agentName = focusedOption.querySelector('span:last-child')?.textContent;
        if (agentName) {
          handleAgentClick(agentName);
        }
      }
    }
  };

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class="agent-switcher" ref={containerRef!}>
      <button
        ref={triggerRef!}
        type="button"
        class={`agent-switcher-trigger ${isOpen() ? "active" : ""}`}
        onClick={toggleDropdown}
        aria-label="Select agent"
        aria-expanded={isOpen()}
        aria-haspopup="listbox"
        disabled={primaryAgents().length === 0}
        title={currentAgent()?.description || 'Select agent'}
      >
        <div style={{ display: "flex", "align-items": "center", gap: "var(--spacing-sm)" }}>
          <div 
            class="agent-color-dot" 
            style={{ 
              "background-color": agentColor(currentAgent()),
              "flex-shrink": 0
            }}
          />
          <span>{currentAgent()?.name || 'Agent'}</span>
        </div>
        <span class={`agent-dropdown-arrow ${dropdownDirection()}`}>
          ▼
        </span>
      </button>

      <Show when={isOpen()}>
        <div class={`agent-dropdown ${dropdownDirection()}`}>
          <For each={primaryAgents()}>
            {(agent) => (
              <div
                class={`agent-option ${agent.name === props.selectedAgent ? "selected" : ""}`}
                onClick={() => handleAgentClick(agent.name)}
                role="option"
                aria-selected={agent.name === props.selectedAgent}
                tabIndex={-1}
              >
                <div 
                  class="agent-color-dot" 
                  style={{ "background-color": agentColor(agent) }}
                />
                <span>{agent.name}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
