-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('RECEBIMENTO', 'DIAGNOSTICO', 'MANUTENCAO_INTERNA', 'ENVIO_TERCEIRO', 'RETORNO_TERCEIRO', 'AGUARDANDO_PECA', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('RECEBIDO', 'EM_ANALISE', 'EM_MANUTENCAO', 'EM_TERCEIRO', 'AGUARDANDO_PECA', 'PRONTO', 'ENTREGUE');

-- CreateTable
CREATE TABLE "OrdemServico" (
    "id" TEXT NOT NULL,
    "numeroExterno" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "descricao" TEXT,
    "statusAtual" "Status" NOT NULL DEFAULT 'RECEBIDO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdemServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "serial" TEXT,
    "defeito" TEXT NOT NULL,
    "ordemId" TEXT NOT NULL,

    CONSTRAINT "Equipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEvento" NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ordemId" TEXT NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicoRealizado" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tecnico" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ordemId" TEXT NOT NULL,

    CONSTRAINT "ServicoRealizado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_ordemId_key" ON "Equipamento"("ordemId");

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "OrdemServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "OrdemServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicoRealizado" ADD CONSTRAINT "ServicoRealizado_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "OrdemServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
