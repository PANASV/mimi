import { useState } from "react";
import { I18N } from "../../lib/i18n";
import { isTauri, overlayMoveStart } from "../../lib/ipc";

interface DragHandleProps {
  onToggleCollapsed: () => void;
  /** Compact variant uses the 42×30 collapsed-overlay drag area. */
  compact?: boolean;
  /** Expanded-handle width (default 120); narrowed on small windows so the
   * handle never overlaps the language capsule or the control buttons. */
  width?: number;
}

/**
 * The drag handle, mirroring `WindowDragArea`: a primary-button press drags
 * the overlay window (through the native drag command, regardless of which
 * child receives the press), and a double-click collapses or expands it.
 */
export function DragHandle({
  onToggleCollapsed,
  compact = false,
  width = 120,
}: DragHandleProps) {
  const [hovered, setHovered] = useState(false);
  const handleWidth = compact ? 42 : width;
  const height = compact ? 30 : 18;

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (event.detail === 2) {
      // The second press toggles instead of dragging. This also covers the
      // plain-Vite preview, where `startDragging` is a no-op.
      onToggleCollapsed();
      return;
    }
    if (!isTauri) return;
    // Record explicit user intent before AppKit takes over the native drag.
    // This prevents an immediately following collapse or Space transition
    // from confusing the new origin with programmatic presentation geometry.
    void overlayMoveStart().catch(() => {});
  };

  return (
    <div
      data-testid="drag-handle"
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={I18N.overlay.dragTooltip}
      className="relative flex items-center justify-center"
      style={{ width: handleWidth, height }}
    >
      {/* Kept clearly visible over bright video: a wider, more opaque grip
          with a dark outline so it reads on both light and dark backdrops. */}
      <div
        style={{
          width: hovered ? 60 : 48,
          height: 5,
          borderRadius: 2.5,
          background: hovered
            ? "rgba(122, 168, 255, 0.95)"
            : "rgba(255, 255, 255, 0.62)",
          boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.35)",
          transition: "width 120ms ease, background 120ms ease",
        }}
      />
    </div>
  );
}
