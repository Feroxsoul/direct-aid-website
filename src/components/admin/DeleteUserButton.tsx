"use client";

import { useRef } from "react";
import { removeAdminUser } from "@/lib/admin/actions";
import { useAdminLang } from "@/lib/admin/i18n-context";

type DeleteUserButtonProps = {
  userId: string;
  userEmail: string;
};

export function DeleteUserButton({ userId, userEmail }: DeleteUserButtonProps) {
  const { t } = useAdminLang();
  const formRef = useRef<HTMLFormElement>(null);

  function handleDelete() {
    const confirmed = window.confirm(t("users.deleteConfirm", { email: userEmail }));
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
        {t("common.delete")}
      </button>
    </>
  );
}
