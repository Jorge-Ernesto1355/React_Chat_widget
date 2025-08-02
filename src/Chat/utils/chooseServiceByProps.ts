import type { ServiceName } from "../services/Service";

export function validateExclusiveKeys<T extends Record<string, any>>(
  obj: T
):
  | { success: true; key: ServiceName; value: string }
  | { success: false; error: string } {
  // Filtrar las llaves que tienen valores (no son undefined, null o string vacío)
  const keysWithValues = Object.entries(obj).filter(([_, value]) => {
    return value !== undefined && value !== null && value !== "";
  });

  // Si no hay ninguna llave con valor
  if (keysWithValues.length === 0) {
    return {
      success: false,
      error: "all keys are empty, undefined or null",
    };
  }

  // Si hay más de una llave con valor
  if (keysWithValues.length > 1) {
    const keysNames = keysWithValues.map(([key]) => key).join(", ");
    return {
      success: false,
      error: `only one key can have a value. Found values in: ${keysNames}`,
    };
  }

  // Si hay exactamente una llave con valor (caso exitoso)
  const [key, value] = keysWithValues[0];
  return {
    success: true,
    key: key as ServiceName,
    value,
  };
}
