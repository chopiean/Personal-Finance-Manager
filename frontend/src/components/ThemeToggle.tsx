import { useTheme } from "../utils/useTheme";

/** Switches between the light (Mint Fresh) and dark (Midnight Gold) looks. */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "midnight";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      className="theme-toggle"
      onClick={toggle}
    >
      <span>{dark ? "Dark mode" : "Light mode"}</span>
      <span className="track" aria-hidden="true">
        <span className="knob">{dark ? "🌙" : "☀️"}</span>
      </span>
    </button>
  );
}
