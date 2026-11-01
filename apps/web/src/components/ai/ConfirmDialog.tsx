import React from 'react';
import { Button } from '@voterrule/ui';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Confirmation Required',
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[var(--surface)] border border-[var(--line-strong)] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-[var(--ink)]">
        <h3 className="font-display font-bold text-base text-[var(--ink)]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm}>
            Confirm Action
          </Button>
        </div>
      </div>
    </div>
  );
};

