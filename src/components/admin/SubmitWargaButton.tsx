'use client';

import { useFormStatus } from 'react-dom';

type SubmitWargaButtonProps = {
  defaultLabel: string;
  pendingLabel: string;
};

export default function SubmitWargaButton({
  defaultLabel,
  pendingLabel,
}: SubmitWargaButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-[#3f6fd5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#325fc0] disabled:cursor-not-allowed disabled:bg-[#9fb4d8]"
      aria-busy={pending}
    >
      {pending ? pendingLabel : defaultLabel}
    </button>
  );
}
