import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import toast from "react-hot-toast";

interface InputFotoPerfilProps {
  fotoActual?: string;
  onChange: (archivo: File | null) => void;
}

export function InputFotoPerfil({
  fotoActual,
  onChange,
}: InputFotoPerfilProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const seleccionar = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];

    // Permite volver a seleccionar el mismo archivo.
    evento.target.value = "";

    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5 MB");
      return;
    }

    const formatosPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!formatosPermitidos.includes(archivo.type)) {
      toast.error("Selecciona una imagen JPG, PNG, WEBP o GIF");
      return;
    }

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const url = URL.createObjectURL(archivo);
    previewRef.current = url;
    setPreview(url);
    onChange(archivo);
  };

  const imagen = preview ?? fotoActual;

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={seleccionar}
        className="hidden"
        aria-label="Seleccionar foto de perfil"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Cambiar foto de perfil"
        className="flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-indigo-100 bg-indigo-50 text-indigo-600 transition hover:opacity-80 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
      >
        {imagen ? (
          <img
            src={imagen}
            alt="Foto de perfil"
            className="size-full object-cover"
          />
        ) : (
          <svg
            aria-hidden="true"
            className="size-12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
          </svg>
        )}
      </button>

      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
        Haz clic para cambiar tu foto
      </p>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        JPG, PNG, WEBP o GIF. Máximo 5 MB.
      </p>
    </div>
  );
}
