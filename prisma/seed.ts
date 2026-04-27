import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  // Verificar se já existe usuário admin
  const existingAdmin = await prisma.usuario.findUnique({
    where: { username: "admin" },
  });

  if (existingAdmin) {
    console.log("Usuário admin já existe.");
    return;
  }

  // Criar usuário admin padrão
  // Nota: Em produção, use bcrypt para hash de senhas
  await prisma.usuario.create({
    data: {
      username: "admin",
      password: "admin123", // Em produção, usar hash: bcrypt.hashSync("admin123", 10)
      nome: "Administrador",
      isAdmin: true,
    },
  });

  console.log("Usuário admin criado com sucesso!");
  console.log("  username: admin");
  console.log("  password: admin123");
}

main()
  .catch((e) => {
    console.error("Erro ao criar usuário admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });