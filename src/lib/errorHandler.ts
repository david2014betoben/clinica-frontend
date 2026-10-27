import axios from "axios";

function obtenerTexto(objeto: unknown, clave: string): string | null {
  if (typeof objeto !== "object" || objeto === null || !(clave in objeto)) {
    return null;
  }

  const valor = (objeto as Record<string, unknown>)[clave];

  return typeof valor === "string" && valor.trim() ? valor : null;
}

export function extraerMensajeError(err: unknown): string {
  if (axios.isAxiosError<unknown>(err)) {
    const datos = err.response?.data;

    const mensaje =
      obtenerTexto(datos, "message") ?? obtenerTexto(datos, "err");

    if (mensaje) {
      return mensaje;
    }

    if (
      typeof datos === "object" &&
      datos !== null &&
      "error" in datos &&
      Array.isArray(datos.error)
    ) {
      const primerMensaje = datos.error
        .map((detalle: unknown) => obtenerTexto(detalle, "message"))
        .find((texto: string | null) => texto !== null);

      if (primerMensaje) {
        return primerMensaje;
      }
    }

    if (!err.response) {
      return "No se pudo conectar con el servidor";
    }

    return `Error del servidor (${err.response.status})`;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Error inesperado";
}
