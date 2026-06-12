export const ADMIN_ROLES = ["super_admin", "admin", "editor"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

const ROLE_RANK: Record<AdminRole, number> = {
  editor: 1,
  admin: 2,
  super_admin: 3,
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin (مطور)",
  admin: "Admin (مدير المحتوى)",
  editor: "Editor (محرر)",
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: "كل الصلاحيات + إدارة المستخدمين",
  admin: "تعديل وحذف المشاريع والفئات والصفحة الرئيسية",
  editor: "تعديل المحتوى فقط — بدون حذف المشاريع أو إدارة المستخدمين",
};

export function hasMinRole(userRole: AdminRole, minRole: AdminRole) {
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole];
}

export function canDeleteProjects(role: AdminRole) {
  return hasMinRole(role, "admin");
}

export function canManageUsers(role: AdminRole) {
  return role === "super_admin";
}
