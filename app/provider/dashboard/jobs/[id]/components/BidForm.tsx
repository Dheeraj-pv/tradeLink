import { useState } from "react";
import type { BidData } from "../types";

interface Props {
  onSubmit: (data: BidData) => Promise<void>;
  submitting: boolean;
}

export function BidForm({ onSubmit, submitting }: Props) {
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return; // Validation handled by disabled button
    }

    await onSubmit({
      amount: amountNumber,
      message: message.trim(),
    });

    // Reset form on success (handled in parent)
    setAmount("");
    setMessage("");
  };

  const isValid =
    amount &&
    !isNaN(Number(amount)) &&
    Number(amount) > 0 &&
    message.trim().length > 0;

  return (
    <form className="detail-card" onSubmit={handleSubmit}>
      <h2 className="detail-card-title">Place Your Bid</h2>

      <div className="auth-field">
        <label>
          Bid Amount ($)
          <span>*</span>
        </label>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div className="auth-field">
        <label>
          Message to Customer
          <span>*</span>
        </label>
        <textarea
          placeholder="Introduce yourself, explain your approach, and mention your availability..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="btn-submit-bid"
        disabled={submitting || !isValid}
      >
        {submitting ? "Submitting..." : "Submit Bid"}
      </button>
    </form>
  );
}
