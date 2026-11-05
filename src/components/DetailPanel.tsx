import type { NetNode } from '../types';
import { LAYERS } from '../data/technologies';

interface Props {
  node: NetNode | null;
  onClose: () => void;
  onMore: () => void;
  floating?: boolean;
}

export default function DetailPanel({ node, onClose, onMore, floating = false }: Props) {
  if (!node) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-500 shadow-sm shadow-slate-200/50">
        Кликните по узлу схемы, чтобы увидеть его роль и интерфейсы.
      </div>
    );
  }

  const layer = LAYERS.find((l) => l.id === node.layer)!;

  return (
    <div
      className={
        'detail-panel rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-sm ' +
        (floating ? 'w-[260px] max-w-[40vw]' : 'w-full')
      }
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div
            className="mb-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: layer.color, borderColor: `${layer.color}40`, backgroundColor: `${layer.color}12` }}
          >
            {layer.label}
          </div>
          <h3 className="text-lg font-semibold leading-tight text-slate-800">{node.label}</h3>
          {!floating && <p className="text-sm text-slate-500">{node.fullName}</p>}
        </div>
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="-mt-1 text-2xl leading-none text-slate-400 transition hover:text-slate-700"
        >
          ×
        </button>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-slate-700">{node.role}</p>

      {node.interfaces.length > 0 && (
        <div>
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
            Interfaces
          </div>
          <div className="flex flex-wrap gap-1.5">
            {node.interfaces.map((i) => (
              <span
                key={i}
                className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-700 ring-1 ring-slate-200"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      {node.badge && (
        <div className="mt-4">
          <span
            className="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: layer.color }}
          >
            {node.badge}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onMore}
        className="mt-4 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
      >
        Подробнее
      </button>
    </div>
  );
}