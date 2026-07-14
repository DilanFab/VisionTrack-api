export const buildSearchFilter = (
  search: string | undefined,
  fields: string[]
): Record<string, unknown>[] | undefined => {
  if (!search || search.trim() === "") return undefined;
  return fields.map((field) => ({
    [field]: { contains: search.trim(), mode: "insensitive" as const },
  }));
};

export const buildEstadoFilter = (
  estado: string | undefined
): Record<string, unknown> | undefined => {
  if (!estado || estado.trim() === "") return undefined;
  return { equals: estado.trim() };
};

export const buildDateFilter = (
  fecha: string | undefined
): Record<string, unknown> | undefined => {
  if (!fecha || fecha.trim() === "") return undefined;
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return undefined;
  const start = new Date(date.setHours(0, 0, 0, 0));
  const end = new Date(date.setHours(23, 59, 59, 999));
  return { gte: start, lte: end };
};

export const buildIntFilter = (
  value: string | undefined
): Record<string, unknown> | undefined => {
  if (!value || value.trim() === "") return undefined;
  const num = parseInt(value, 10);
  if (isNaN(num)) return undefined;
  return { equals: num };
};
