import prisma from "../config/prisma";

export const registrarPushToken = async (usuarioId: number, token: string) => {
  const existing = await prisma.tbl_push_token.findFirst({
    where: { usuario_id: usuarioId, token },
  });

  if (existing) {
    return { push_token_id: existing.push_token_id, duplicado: true };
  }

  const pushToken = await prisma.tbl_push_token.create({
    data: { usuario_id: usuarioId, token },
  });

  return { push_token_id: pushToken.push_token_id, duplicado: false };
};

export const eliminarPushToken = async (usuarioId: number, token: string) => {
  return prisma.tbl_push_token.deleteMany({
    where: { usuario_id: usuarioId, token },
  });
};
