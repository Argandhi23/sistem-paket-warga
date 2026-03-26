import { BellDot } from "lucide-react";

type AuthActionsProps = {
  onForgotPasswordClick: () => void;
};

export function AuthActions({ onForgotPasswordClick }: AuthActionsProps) {
  return (
    <div className="flex items-center justify-end gap-4">
      <button
        type="button"
        onClick={onForgotPasswordClick}
        className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-blue-700 outline-none transition hover:text-blue-900 focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        <BellDot className="h-4 w-4" aria-hidden="true" />
        Forgot password?
      </button>
    </div>
  );
}
