import * as React from "react";
import { Flag } from "lucide-react";
import "./FlagButton.css";

/**
 * 
 * @param {isFlagged} param0 - Boolean indicating if the item is flagged
 * @param {onClick} param1 - Function to be called when the button is clicked
 * 
 * This component renders a button that allows users to flag or unflag an item.
 * The button's appearance changes based on the flagged state, and it includes an icon and label.
 * 
 * @returns FlagButton component
 */
export default function FlagButton({ isFlagged, onClick }) {
  return (
    <button
      className={`${isFlagged ? "flag-button--flagged" : "flag-button"}`}
      onClick={onClick}
      aria-label={isFlagged ? "Unflag item" : "Flag item"}
    >
      <Flag size={20} />
      {isFlagged ? "Flagged" : "Flag Item"}
    </button>
  );
}

