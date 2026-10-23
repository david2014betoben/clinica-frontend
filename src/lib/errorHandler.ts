export function extraerMensajeError(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }

  return "Error inesperado";
}
