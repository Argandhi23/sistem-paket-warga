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
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg"
    >
      {pending ? pendingLabel : defaultLabel}
    </button>
  );
}
