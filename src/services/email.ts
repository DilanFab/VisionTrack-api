import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailRecordatorio {
  to: string;
  nombre: string;
  doctorNombre: string;
  especialidad: string;
  fecha: Date;
  hora: Date;
}

interface EmailResetPassword {
  to: string;
  nombre: string;
  token: string;
  frontendUrl?: string;
}

export const enviarEmailRecordatorio = async ({
  to,
  nombre,
  doctorNombre,
  especialidad,
  fecha,
  hora,
}: EmailRecordatorio) => {
  const fechaStr = fecha.toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaStr = hora.toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await resend.emails.send({
    from: "VisionTrack <onboarding@resend.dev>",
    to,
    subject: "Recordatorio de cita - VisionTrack",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Recordatorio de Cita</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Te recordamos que tienes una cita programada:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Doctor:</strong> ${doctorNombre}</p>
          <p><strong>Especialidad:</strong> ${especialidad}</p>
          <p><strong>Fecha:</strong> ${fechaStr}</p>
          <p><strong>Hora:</strong> ${horaStr}</p>
        </div>
        <p>Si necesitas cancelar o reprogramar, por favor contáctanos.</p>
        <p style="color: #6b7280; font-size: 12px;">VisionTrack - Sistema de Gestión de Citas</p>
      </div>
    `,
  });
};

export const enviarEmailResetPassword = async ({
  to,
  nombre,
  token,
  frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173",
}: EmailResetPassword) => {
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "VisionTrack <onboarding@resend.dev>",
    to,
    subject: "Recuperación de contraseña - VisionTrack",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Recuperación de Contraseña</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña. El enlace expirará en 1 hora.</p>
        <div style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Restablecer contraseña</a>
        </div>
        <p style="color: #6b7280; font-size: 13px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
        <p style="color: #6b7280; font-size: 12px;">VisionTrack - Sistema de Gestión de Citas</p>
      </div>
    `,
  });
};
