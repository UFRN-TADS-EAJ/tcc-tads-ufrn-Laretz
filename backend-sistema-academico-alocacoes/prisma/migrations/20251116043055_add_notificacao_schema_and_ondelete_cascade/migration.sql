-- CreateEnum
CREATE TYPE "public"."NotificacaoStatus" AS ENUM ('PENDENTE', 'LIDA', 'RESPONDIDA');

-- CreateEnum
CREATE TYPE "public"."NotificacaoType" AS ENUM ('SOLICITACAO_TROCA_SALA', 'GENERICA');

-- CreateTable
CREATE TABLE "public"."Notificacao" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificacaoType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "public"."NotificacaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "replyMessage" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Notificacao" ADD CONSTRAINT "Notificacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
