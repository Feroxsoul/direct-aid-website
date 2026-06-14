"use client";

import { useRef } from "react";
import { removeAdminUser } from "@/lib/admin/actions";

type DeleteUserButtonProps = {
  userId: string;
  userEmail: string;
};

export function DeleteUserButton({ userId, userEmail }: DeleteUserButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userEmail}?\n\nThis cannot be undone.`,
    );
    if (confirmed) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <>
      <form ref={formRef} action={removeAdminUser} className="admin-actions">
        <input type="hidden" name="id" value={userId} />
      </form>
      <button type="button" className="dash-btn dash-btn--danger" onClick={handleDelete}>
        Delete
      </button>
    </>
  );
}
