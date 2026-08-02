import React from "react";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

/**
 * Reusable quantity selector (− / count / +).
 *
 * Props
 * ─────────────────────────────────────────────────
 * quantity         {number}   Current displayed value
 * onDecrease       {func}     Called when − is clicked (parent decides remove logic)
 * onIncrease       {func}     Called when + is clicked
 * decreaseDisabled {bool}     Disable the − button (e.g., min-qty guard). Default false.
 * size             {"sm"|"md"} Button size preset.  Default "md"
 */
export default function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  onRemove, // optional: called when trash is shown and clicked
  decreaseDisabled = false,
  size = "md",
}) {
  const btnSize = size === "sm" ? 28 : 32;
  const fontSize = size === "sm" ? "1rem" : "1.1rem";
  const countFontSize = size === "sm" ? "0.97rem" : "1.05rem";
  const showTrash = Number(quantity) === 1;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        onClick={showTrash ? onRemove : onDecrease}
        disabled={showTrash ? !onRemove : decreaseDisabled}
        title={showTrash ? (onRemove ? "Remove item" : "Remove (not available)") : "Decrease"}
        style={{
          ...btnStyle({ disabled: showTrash ? !onRemove : decreaseDisabled, size: btnSize, fontSize }),
          color: showTrash && onRemove ? "#e53935" : undefined,
        }}
      >
        {showTrash ? <DeleteOutlineIcon style={{ fontSize: 20 }}/> : "−"}
      </button>

      <span
        style={{
          minWidth: size === "sm" ? 24 : 28,
          textAlign: "center",
          fontWeight: 700,
          fontSize: countFontSize,
          color: "#222",
          userSelect: "none",
        }}
      >
        {quantity}
      </span>

      <button
        onClick={onIncrease}
        style={btnStyle({ disabled: false, size: btnSize, fontSize })}
      >
        +
      </button>
    </div>
  );
}

function btnStyle({ disabled, size, fontSize }) {
  return {
    width: size,
    height: size,
    border: "1.5px solid #b2dfdb",
    borderRadius: 6,
    background: disabled ? "#f5f5f5" : "#fff",
    color: disabled ? "#bbb" : "#00695c",
    fontWeight: 800,
    fontSize,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color 0.15s",
    flexShrink: 0,
  };
}
