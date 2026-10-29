import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { InputFotoPerfil } from "../componentes/InputFotoPerfil";
import { perfilSchema } from "../schemas/perfilSchema";
import type { PerfilFormData } from "../schemas/perfilSchema";
import { actualizarPerfil } from "../services/perfil";
import { useAuthStore } from "../stores/authStore";
import { extraerMensajeError } from "../lib/errorHandler";

function obtenerUrlFoto(foto?: string | null): string | undefined {
  if (!foto) return undefined;

  // Las fotos se sirven desde /uploads, fuera de /api.
  const base = new URL(import.meta.env.VITE_API_URL, window.location.origin);

  return new URL(foto, base.origin).href;
}

export function PaginaPerfil() {
  const usuario = useAuthStore((state) => state.usuario);
  const actualizarUsuario = useAuthStore((state) => state.actualizarUsuario);

  const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
  const [versionFoto, setVersionFoto] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: usuario?.nombre ?? "",
      email: usuario?.email ?? "",
      telefono: usuario?.telefono ?? "",
    },
  });

  const guardar = async (datos: PerfilFormData) => {
    const formData = new FormData();

    formData.append("nombre", datos.nombre);
    formData.append("email", datos.email);
    formData.append("telefono", datos.telefono ?? "");

    if (archivoFoto) {
      formData.append("foto", archivoFoto);
    }

    try {
      const actualizado = await actualizarPerfil(formData);

      actualizarUsuario(actualizado);

      reset({
        nombre: actualizado.nombre,
        email: actualizado.email,
        telefono: actualizado.telefono ?? "",
      });

      setArchivoFoto(null);
      setVersionFoto((actual) => actual + 1);

      toast.success("Perfil actualizado");
    } catch (err: unknown) {
      toast.error(extraerMensajeError(err));
    }
  };

  const claseInput =
    "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
          Mi perfil
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Actualiza tus datos personales y tu foto de perfil.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(guardar)}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        <fieldset disabled={isSubmitting} className="space-y-6">
          <InputFotoPerfil
            key={versionFoto}
            fotoActual={obtenerUrlFoto(usuario?.foto)}
            onChange={setArchivoFoto}
          />

          <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
            <label className="block text-sm font-medium">
              Nombre
              <input
                {...register("nombre")}
                autoComplete="name"
                className={claseInput}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? "error-nombre" : undefined}
              />
            </label>

            {errors.nombre && (
              <p
                id="error-nombre"
                role="alert"
                className="mt-1 text-sm text-rose-600 dark:text-rose-400"
              >
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Correo electrónico
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className={claseInput}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "error-email" : undefined}
              />
            </label>

            {errors.email && (
              <p
                id="error-email"
                role="alert"
                className="mt-1 text-sm text-rose-600 dark:text-rose-400"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Teléfono (opcional)
              <input
                {...register("telefono")}
                type="tel"
                autoComplete="tel"
                placeholder="Entre 8 y 15 dígitos"
                className={claseInput}
                aria-invalid={Boolean(errors.telefono)}
                aria-describedby={
                  errors.telefono ? "error-telefono" : undefined
                }
              />
            </label>

            {errors.telefono && (
              <p
                id="error-telefono"
                role="alert"
                className="mt-1 text-sm text-rose-600 dark:text-rose-400"
              >
                {errors.telefono.message}
              </p>
            )}
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
