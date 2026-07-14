const isProd = process.env.NODE_ENV === "production";

export const logger = {
  error(msg: string, ...args: unknown[]): void {
    if (isProd) {
      // En producción solo loguea a stderr sin exponer stack traces al cliente
      process.stderr.write(`[ERROR] ${msg}\n`);
    } else {
      console.error(msg, ...args);
    }
  },
  info(msg: string, ...args: unknown[]): void {
    if (!isProd) {
      console.log(msg, ...args);
    }
  },
};
