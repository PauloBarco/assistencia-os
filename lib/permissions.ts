import { isRecord } from "@/lib/http";

export const USER_PERMISSION_FIELDS = [
  "canManageUsers",
  "canCreateOrders",
  "canEditOrders",
  "canDeleteOrders",
  "canUpdateStatus",
  "canViewReports",
] as const;

export type UserPermissionKey = (typeof USER_PERMISSION_FIELDS)[number];
export type UserPermissions = Record<UserPermissionKey, boolean>;

export const USER_PERMISSION_OPTIONS: Array<{
  key: UserPermissionKey;
  label: string;
  description: string;
}> = [
  {
    key: "canManageUsers",
    label: "Gerenciar usuarios",
    description: "Criar, editar e excluir usuarios.",
  },
  {
    key: "canCreateOrders",
    label: "Criar ordens",
    description: "Cadastrar novas ordens de servico.",
  },
  {
    key: "canEditOrders",
    label: "Editar ordens",
    description: "Alterar dados, eventos e servicos.",
  },
  {
    key: "canDeleteOrders",
    label: "Excluir ordens",
    description: "Remover ordens e registros vinculados.",
  },
  {
    key: "canUpdateStatus",
    label: "Alterar status",
    description: "Mover cards no kanban e atualizar fluxo.",
  },
  {
    key: "canViewReports",
    label: "Ver relatorios",
    description: "Acessar indicadores e analises.",
  },
];

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  canManageUsers: false,
  canCreateOrders: true,
  canEditOrders: true,
  canDeleteOrders: true,
  canUpdateStatus: true,
  canViewReports: true,
};

export const ADMIN_PERMISSIONS: UserPermissions = {
  canManageUsers: true,
  canCreateOrders: true,
  canEditOrders: true,
  canDeleteOrders: true,
  canUpdateStatus: true,
  canViewReports: true,
};

export const USER_PERMISSION_SELECT = {
  canManageUsers: true,
  canCreateOrders: true,
  canEditOrders: true,
  canDeleteOrders: true,
  canUpdateStatus: true,
  canViewReports: true,
} as const;

type PermissionSource = Partial<UserPermissions> & {
  isAdmin?: boolean;
  permissions?: Partial<UserPermissions>;
};

export function readBooleanValue(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }

  return undefined;
}

export function getEffectivePermissions(source: PermissionSource = {}): UserPermissions {
  if (source.isAdmin) {
    return { ...ADMIN_PERMISSIONS };
  }

  return USER_PERMISSION_FIELDS.reduce((permissions, key) => {
    const directValue = source[key];
    const nestedValue = source.permissions?.[key];

    permissions[key] =
      typeof directValue === "boolean"
        ? directValue
        : typeof nestedValue === "boolean"
          ? nestedValue
          : DEFAULT_USER_PERMISSIONS[key];

    return permissions;
  }, {} as UserPermissions);
}

export function hasPermission(source: PermissionSource, permission: UserPermissionKey) {
  return getEffectivePermissions(source)[permission];
}

export function readPermissionsFromPayload(
  payload: unknown,
  isAdmin: boolean,
  fallback: UserPermissions = DEFAULT_USER_PERMISSIONS
): UserPermissions {
  if (isAdmin) {
    return { ...ADMIN_PERMISSIONS };
  }

  if (!isRecord(payload)) {
    return { ...fallback };
  }

  return USER_PERMISSION_FIELDS.reduce((permissions, key) => {
    permissions[key] = readBooleanValue(payload[key]) ?? fallback[key];
    return permissions;
  }, {} as UserPermissions);
}
