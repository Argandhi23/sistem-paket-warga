import { BellDot, SquareCheckBig } from "lucide-react";

type AuthActionsProps = {
  rememberMe: boolean;
  onRememberMeChange: (checked: boolean) => void;
  onForgotPasswordClick: () => void;
};

export function AuthActions({
  rememberMe,
  onRememberMeChange,
  onForgotPasswordClick,
}: AuthActionsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <SquareCheckBig className="h-4 w-4 text-slate-500" aria-hidden="true" />
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(event) => onRememberMeChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-300"
        />
        Remember me
      </label>

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
