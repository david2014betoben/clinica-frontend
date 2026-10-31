const bloque = "animate-pulse rounded bg-slate-200 dark:bg-slate-700";

export function SkeletonMetricCard() {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-44 min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`${bloque} mt-1 h-5 w-36`} />
        <div className={`${bloque} size-10 shrink-0 rounded-lg`} />
      </div>

      <div className={`${bloque} mt-5 h-10 w-20`} />
      <div className={`${bloque} mt-2 h-4 w-full max-w-56`} />
    </div>
  );
}

export function SkeletonPacienteRow() {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-80 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center gap-3">
        <div className={`${bloque} size-11 shrink-0 rounded-lg`} />

        <div className="min-w-0 flex-1 space-y-2">
          <div className={`${bloque} h-5 w-3/4`} />
          <div className={`${bloque} h-4 w-full`} />
        </div>
      </div>

      <div className={`${bloque} mt-4 h-6 w-32`} />

      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="space-y-2">
          <div className={`${bloque} h-3 w-16`} />
          <div className={`${bloque} h-4 w-28`} />
        </div>

        <div className="space-y-2">
          <div className={`${bloque} h-3 w-20`} />
          <div className={`${bloque} h-4 w-36`} />
        </div>
      </div>

      <div className="mt-auto flex gap-2 pt-5">
        <div className={`${bloque} h-9 flex-1`} />
        <div className={`${bloque} h-9 w-20`} />
      </div>
    </div>
  );
}

export function SkeletonCitaRow() {
  return (
    <tr aria-hidden="true" className="h-20">
      {Array.from({ length: 5 }, (_, indice) => (
        <td key={indice} className="px-5 py-4">
          <div className={`${bloque} h-4 w-full max-w-36`} />
        </td>
      ))}
    </tr>
  );
}
