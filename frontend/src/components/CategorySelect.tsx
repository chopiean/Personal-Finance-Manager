// src/components/CategorySelect.tsx
import { useState } from "react";
import { sameCategory, uniqueCategories } from "../constants/categories";

const CUSTOM = "__custom__";

const fieldStyle = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 15,
};

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Standard categories for this form. */
  options: string[];
  /** Shown first in a "Your budgets" group (e.g. this month's budgets). */
  budgetCategories?: string[];
  /** Label for the empty option. */
  emptyLabel: string;
};

export default function CategorySelect({
  id,
  value,
  onChange,
  options,
  budgetCategories = [],
  emptyLabel,
}: Props) {
  const budgets = uniqueCategories(budgetCategories);
  const standard = uniqueCategories(options).filter(
    (o) => !budgets.some((b) => sameCategory(b, o))
  );
  const all = [...budgets, ...standard];

  // Custom mode is on when the user chose "Custom…", or when the current
  // value isn't one of the listed options.
  const [customMode, setCustomMode] = useState(false);
  const isListed = all.some((c) => c === value);
  const showCustom = customMode || (value !== "" && !isListed);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="field-label" htmlFor={id}>
        Category
      </label>
      <select
        id={id}
        className="select"
        value={showCustom ? CUSTOM : value}
        onChange={(e) => {
          if (e.target.value === CUSTOM) {
            setCustomMode(true);
            onChange("");
          } else {
            setCustomMode(false);
            onChange(e.target.value);
          }
        }}
        style={fieldStyle}
      >
        <option value="">{emptyLabel}</option>
        {budgets.length > 0 && (
          <optgroup label="Your budgets">
            {budgets.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label={budgets.length > 0 ? "Other categories" : "Categories"}>
          {standard.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </optgroup>
        <option value={CUSTOM}>Custom…</option>
      </select>

      {showCustom && (
        <input
          className="input"
          aria-label="Custom category"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter custom category…"
          autoFocus
          style={{ ...fieldStyle, marginTop: 6 }}
        />
      )}
    </div>
  );
}
