ALTER TABLE "Usuario"
ADD COLUMN "canManageUsers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "canCreateOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "canEditOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "canDeleteOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "canUpdateStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "canViewReports" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Usuario"
SET
  "canManageUsers" = true,
  "canCreateOrders" = true,
  "canEditOrders" = true,
  "canDeleteOrders" = true,
  "canUpdateStatus" = true,
  "canViewReports" = true
WHERE "isAdmin" = true;
