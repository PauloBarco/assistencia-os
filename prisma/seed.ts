import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }

  return value;
}

async function main() {
  const adminUsername = getRequiredEnv("APP_ADMIN_USERNAME");
  const adminPassword = getRequiredEnv("APP_ADMIN_PASSWORD");

  const existingAdmin = await prisma.usuario.findUnique({
    where: { username: adminUsername },
  });

  if (existingAdmin) {
    console.log("Usuario admin ja existe.");
    return;
  }

  await prisma.usuario.create({
    data: {
      username: adminUsername,
      password: adminPassword,
      nome: "Administrador",
      isAdmin: true,
    },
  });

  console.log("Usuario admin criado com sucesso!");
  console.log(`  username: ${adminUsername}`);
}

main()
  .catch((e) => {
    console.error("Erro ao criar usuario admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
