import cron from "node-cron";
import prisma from "../config/prisma";
import { enviarEmailRecordatorio } from "../services/email";
import { enviarPushExpo } from "../services/push";
import { logger } from "../utils/logger";

export const iniciarRecordatorioCitas = () => {
  cron.schedule("*/30 * * * *", async () => {
    console.log("[CRON] Verificando citas para recordatorio...");

    try {
      const hoy = new Date();
      const manana = new Date(Date.now() + 86400000);
      const hoyStr = hoy.toISOString().split("T")[0];
      const mananaStr = manana.toISOString().split("T")[0];

      const citas = await prisma.tbl_cita.findMany({
        where: {
          cita_fecha: { in: [new Date(hoyStr), new Date(mananaStr)] },
          cita_notificacion_enviada: false,
          estado_cita: { estado_cita_nombre: "Programada" },
        },
        include: {
          horario_doctor: {
            include: {
              doctor: {
                include: {
                  especialidad_medica: true,
                  perfil: {
                    include: {
                      usuario: { include: { persona: true } },
                    },
                  },
                },
              },
            },
          },
          historia_clinica: {
            include: {
              perfil: {
                include: {
                  usuario: { include: { persona: true } },
                },
              },
            },
          },
        },
      });

      if (citas.length === 0) {
        console.log("[CRON] No hay citas para recordar.");
        return;
      }

      console.log(`[CRON] ${citas.length} citas para recordar.`);

      for (const cita of citas) {
        try {
          const usuario = cita.historia_clinica.perfil.usuario;
          const email = usuario.persona.persona_correo;
          const nombre = `${usuario.persona.persona_primer_nombre} ${usuario.persona.persona_primer_apellido}`;
          const doctorUsuario = cita.horario_doctor.doctor.perfil.usuario;
          const doctorNombre = `${doctorUsuario.persona.persona_primer_nombre} ${doctorUsuario.persona.persona_primer_apellido}`;
          const especialidad = cita.horario_doctor.doctor.especialidad_medica.especialidad_medica_nombre;
          const hora = cita.horario_doctor.horario_doctor_inicio;

          // Enviar email
          await enviarEmailRecordatorio({
            to: email,
            nombre,
            doctorNombre,
            especialidad,
            fecha: cita.cita_fecha,
            hora,
          });

          // Enviar push
          const tokenRecord = await prisma.tbl_push_token.findFirst({
            where: { usuario_id: usuario.usuario_id },
          });
          if (tokenRecord) {
            await enviarPushExpo({
              token: tokenRecord.token,
              title: "Recordatorio de cita",
              body: `Tienes una cita con ${doctorNombre} el ${cita.cita_fecha.toLocaleDateString("es-EC")} a las ${hora.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`,
            });
          }

          // Marcar como enviada
          await prisma.tbl_cita.update({
            where: { cita_id: cita.cita_id },
            data: { cita_notificacion_enviada: true },
          });

          console.log(`[CRON] Notificación enviada para cita ${cita.cita_id}`);
        } catch (error) {
          logger.error({ err: error }, `[CRON] Error al enviar notificación para cita ${cita.cita_id}`);
        }
      }
    } catch (error) {
      logger.error({ err: error }, "[CRON] Error en job de recordatorios");
    }
  });

  console.log("[CRON] Job de recordatorio de citas iniciado (cada 30 min)");
};
