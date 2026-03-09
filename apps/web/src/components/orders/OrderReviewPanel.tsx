import { useState } from 'react';

type OrderReviewPanelProps = {
  onReview: (decision: 'APPROVE' | 'REJECT', comment?: string) => Promise<void>;
  disabled: boolean;
  title: string;
  notePlaceholder: string;
};

export function OrderReviewPanel({ onReview, disabled, title, notePlaceholder }: OrderReviewPanelProps) {
  const [comment, setComment] = useState('');
  return (
    <div className="review-panel">
      <strong>{title}</strong>
      <input
        placeholder={notePlaceholder}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="review-actions">
        <button type="button" disabled={disabled} onClick={() => void onReview('APPROVE', comment)}>
          Approve
        </button>
        <button type="button" className="danger" disabled={disabled} onClick={() => void onReview('REJECT', comment)}>
          Reject
        </button>
      </div>
    </div>
  );
}
