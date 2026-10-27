import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { loginSchema, type LoginFormData } from "../schemas/loginSchema";

import { login } from "../services/auth";
import { useAuthStore } from "../stores/authStore";
import { extraerMensajeError } from "../lib/errorHandler";

const estiloLabel =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300";

const estiloInput =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

function clasesInput(conError: boolean): string {
  return conError
    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-800"
    : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700";
}

export function PaginaLogin() {
  const navigate = useNavigate();

  const guardarSesion = useAuthStore((state) => state.login);

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(datos: LoginFormData) {
    setErrorServidor("");

    try {
      const respuesta = await login(datos);

      guardarSesion(respuesta.token, respuesta.usuario);

      toast.success("¡Bienvenido a MediPulse!");

      navigate("/", { replace: true });
    } catch (err: unknown) {
      const mensaje = extraerMensajeError(err);

      setErrorServidor(mensaje);
      toast.error(mensaje);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <section
        aria-labelledby="titulo-login"
        className="w-full max-w-md rounded-3xl border border-indigo-100 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 sm:p-8"
      >
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <svg
              aria-hidden="true"
              className="size-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h4l2.2-5 4.2 10 2.1-5H21" />
            </svg>
          </div>

          <h1
            id="titulo-login"
            className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white"
          >
            Bienvenido a MediPulse
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Ingresa tus datos para acceder al sistema de gestión clínica.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-5"
          noValidate
        >
          <div>
            <label htmlFor="login-email" className={estiloLabel}>
              Correo electrónico
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="correo@ejemplo.com"
              autoComplete="username"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "error-email" : undefined}
              {...register("email")}
              className={`${estiloInput} ${clasesInput(Boolean(errors.email))}`}
            />

            {errors.email && (
              <p
                id="error-email"
                role="alert"
                className="mt-1.5 text-sm text-rose-600 dark:text-rose-400"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className={estiloLabel}>
              Contraseña
            </label>

            <div className="relative">
              <input
                id="login-password"
                type={mostrarPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "error-password" : undefined
                }
                {...register("password")}
                className={`${estiloInput} pr-20 ${clasesInput(
                  Boolean(errors.password),
                )}`}
              />

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setMostrarPassword((actual) => !actual)}
                aria-label={
                  mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={mostrarPassword}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-semibold text-slate-500 transition hover:text-indigo-600 disabled:opacity-50 dark:text-slate-400 dark:hover:text-indigo-300"
              >
                {mostrarPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {errors.password && (
              <p
                id="error-password"
                role="alert"
                className="mt-1.5 text-sm text-rose-600 dark:text-rose-400"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {errorServidor && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
            >
              {errorServidor}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && (
              <span
                aria-hidden="true"
                className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}

            {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-5 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Si necesitas una cuenta, contacta al administrador.
          </p>
        </div>
      </section>
    </main>
  );
}
