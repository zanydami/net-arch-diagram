import { useState } from 'react';
import type { NetNode, Technology } from '../types';
import { interfaceDescriptions } from '../data/interfaceDescriptions';
import {
  interfaceReferenceDetails,
  nodeReferenceDetails,
  technologyInterfaceReferenceDetails,
} from '../data/referenceDetails';
import {
  architectureSourcesByTechnology,
  interfaceSourcesByTechnology,
  type SpecificationSource,
} from '../data/specificationSources';
import { LAYERS } from '../data/technologies';

export type ReferenceKind = 'node' | 'interface';

export interface ReferenceSelection {
  kind: ReferenceKind;
  id: string;
}

interface Props {
  technologies: Technology[];
  technologyId: string;
  initialSelection: ReferenceSelection | null;
  onClose: () => void;
}

export default function ReferenceDirectory({
  technologies,
  technologyId,
  initialSelection,
  onClose,
}: Props) {
  const [activeTechnologyId, setActiveTechnologyId] = useState(technologyId);
  const [kind, setKind] = useState<ReferenceKind>(initialSelection?.kind ?? 'node');
  const [selectedId, setSelectedId] = useState(initialSelection?.id ?? '');
  const [query, setQuery] = useState('');
  const technology = technologies.find((item) => item.id === activeTechnologyId) ?? technologies[0];

  const interfaceNames = Array.from(new Set(technology.nodes.flatMap((node) => node.interfaces))).sort();
  const entries = kind === 'node'
    ? technology.nodes.map((node) => ({
        id: node.id,
        title: node.label,
        subtitle: nodeReferenceDetails[`${technology.id}:${node.id}`]?.expansion ?? node.fullName,
        searchText: `${node.label} ${node.fullName} ${node.role} ${nodeReferenceDetails[`${technology.id}:${node.id}`]?.expansion ?? ''} ${nodeReferenceDetails[`${technology.id}:${node.id}`]?.details ?? ''}`,
      }))
    : interfaceNames.map((name) => ({
        id: name,
        title: name,
        subtitle: interfaceDescriptions[name] ?? 'Интерфейс обмена данными между узлами сети.',
        searchText: `${name} ${interfaceDescriptions[name] ?? ''} ${interfaceReferenceDetails[name]?.expansion ?? ''} ${interfaceReferenceDetails[name]?.details ?? ''} ${technology.nodes
          .filter((node) => node.interfaces.includes(name))
          .map((node) => `${node.label} ${node.role}`)
          .join(' ')}`,
      }));

  const filteredEntries = entries.filter((entry) =>
    entry.searchText.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  );
  const activeId = filteredEntries.some((entry) => entry.id === selectedId)
    ? selectedId
    : filteredEntries[0]?.id ?? '';
  const selectedNode = kind === 'node'
    ? technology.nodes.find((node) => node.id === activeId) ?? null
    : null;
  const selectedInterface = kind === 'interface' ? activeId : '';
  const interfaceNodes = selectedInterface
    ? technology.nodes.filter((node) => node.interfaces.includes(selectedInterface))
    : [];
  const interfaceLinks = selectedInterface
    ? technology.links.filter((link) => link.label === selectedInterface)
    : [];
  const architectureSources = architectureSourcesByTechnology[technology.id] ?? [];
  const selectedInterfaceSources = selectedInterface
    ? mergeSources(
        architectureSources,
        interfaceSourcesByTechnology[technology.id]?.[selectedInterface] ?? []
      )
    : [];

  const selectKind = (nextKind: ReferenceKind) => {
    setKind(nextKind);
    setSelectedId('');
    setQuery('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-2 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reference-title"
        className="reference-directory-panel flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Mobile Network Architecture
            </p>
            <h2 id="reference-title" className="text-lg font-semibold text-slate-900">
              Справочник
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть справочник"
            className="flex h-9 w-9 items-center justify-center rounded-md text-2xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            ×
          </button>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="flex rounded-md border border-slate-200 p-0.5" aria-label="Тип справки">
            {(['node', 'interface'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={kind === value}
                onClick={() => selectKind(value)}
                className={`rounded px-3 py-1.5 text-sm transition ${
                  kind === value ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {value === 'node' ? 'Узлы' : 'Интерфейсы'}
              </button>
            ))}
          </div>
          <div className="flex max-w-full gap-1 overflow-x-auto" aria-label="Поколение сети">
            {technologies.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={activeTechnologyId === item.id}
                onClick={() => {
                  setActiveTechnologyId(item.id);
                  setSelectedId('');
                  setQuery('');
                }}
                className={`shrink-0 rounded px-2.5 py-1.5 text-xs font-medium transition ${
                  activeTechnologyId === item.id
                    ? 'bg-teal-100 text-teal-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.8fr)]">
          <aside className="flex min-h-0 flex-col border-b border-slate-200 md:border-b-0 md:border-r">
            <div className="border-b border-slate-200 p-3 sm:p-4">
              <label className="sr-only" htmlFor="reference-search">Поиск в справочнике</label>
              <input
                id="reference-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск по названию или описанию"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="max-h-44 min-h-0 flex-1 overflow-y-auto md:max-h-none">
              {filteredEntries.length ? filteredEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-current={activeId === entry.id ? 'true' : undefined}
                  onClick={() => setSelectedId(entry.id)}
                  className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition ${
                    activeId === entry.id ? 'border-l-2 border-l-teal-600 bg-teal-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-800">{entry.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{entry.subtitle}</span>
                </button>
              )) : (
                <p className="px-4 py-6 text-sm text-slate-500">Ничего не найдено</p>
              )}
            </div>
          </aside>

          <article className="min-h-0 overflow-y-auto p-4 sm:p-6">
            {selectedNode ? (
              <NodeReference
                node={selectedNode}
                technology={technology}
                sources={architectureSources}
                onSelectInterface={(name) => {
                  setKind('interface');
                  setSelectedId(name);
                  setQuery('');
                }}
              />
            ) : selectedInterface ? (
              <InterfaceReference
                name={selectedInterface}
                technology={technology}
                nodes={interfaceNodes}
                links={interfaceLinks}
                sources={selectedInterfaceSources}
              />
            ) : (
              <p className="text-sm text-slate-500">Выберите запись или измените запрос поиска.</p>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}

function NodeReference({
  node,
  technology,
  sources,
  onSelectInterface,
}: {
  node: NetNode;
  technology: Technology;
  sources: SpecificationSource[];
  onSelectInterface: (name: string) => void;
}) {
  const layer = LAYERS.find((item) => item.id === node.layer)!;
  const details = nodeReferenceDetails[`${technology.id}:${node.id}`];
  const connections = technology.links
    .filter((link) => link.from === node.id || link.to === node.id)
    .map((link) => {
      const peerId = link.from === node.id ? link.to : link.from;
      return {
        link,
        peer: technology.nodes.find((item) => item.id === peerId),
      };
    })
    .filter((item) => item.peer);

  return (
    <>
      <span
        className="inline-flex rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: layer.color, borderColor: `${layer.color}55`, backgroundColor: `${layer.color}12` }}
      >
        {layer.label}
      </span>
      <h3 className="mt-3 text-xl font-semibold text-slate-900">{node.label}</h3>
      <section className="mt-4">
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Кратко</h4>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-700">{node.role}</p>
      </section>
      <section className="mt-4">
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Расшифровка
        </h4>
        <p className="text-sm text-slate-600">{details?.expansion ?? node.fullName}</p>
      </section>
      <section className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Подробное описание
        </h4>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-700">
          {details?.details ?? node.role}
        </p>
      </section>

      {node.interfaces.length > 0 && (
        <section className="mt-6">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Интерфейсы узла
          </h4>
          <div className="flex flex-wrap gap-2">
            {node.interfaces.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onSelectInterface(name)}
                className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
              >
                {name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Связи в {technology.label}
        </h4>
        {connections.length ? (
          <ul className="divide-y divide-slate-100 border-y border-slate-100">
            {connections.map(({ link, peer }) => (
              <li key={link.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-slate-700">{peer?.label}</span>
                <span className="font-mono text-xs text-slate-500">{link.label ?? 'транспорт'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Для этого узла связи не заданы.</p>
        )}
      </section>
      <SourceList sources={sources} />
    </>
  );
}

function InterfaceReference({
  name,
  technology,
  nodes,
  links,
  sources,
}: {
  name: string;
  technology: Technology;
  nodes: NetNode[];
  links: Technology['links'];
  sources: SpecificationSource[];
}) {
  const details =
    technologyInterfaceReferenceDetails[`${technology.id}:${name}`] ?? interfaceReferenceDetails[name];

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Интерфейс</p>
      <h3 className="mt-2 font-mono text-xl font-semibold text-slate-900">{name}</h3>
      <section className="mt-4">
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Кратко</h4>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-700">
        {interfaceDescriptions[name] ?? 'Интерфейс обмена данными между сетевыми узлами.'}
        </p>
      </section>
      <section className="mt-4">
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Расшифровка
        </h4>
        <p className="text-sm text-slate-600">
          {details?.expansion ?? 'Стандартизованное обозначение интерфейса.'}
        </p>
      </section>
      <section className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Подробное описание
        </h4>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-700">
          {details?.details ?? interfaceDescriptions[name] ?? 'Интерфейс обмена данными между сетевыми узлами.'}
        </p>
      </section>

      <section className="mt-6">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Участвующие узлы
        </h4>
        <ul className="divide-y divide-slate-100 border-y border-slate-100">
          {nodes.map((node) => (
            <li key={node.id} className="py-3">
              <p className="text-sm font-medium text-slate-800">{node.label}</p>
              <p className="mt-0.5 text-sm text-slate-600">{node.role}</p>
            </li>
          ))}
        </ul>
      </section>

      {links.length > 0 && (
        <section className="mt-6">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Соединения в схеме
          </h4>
          <ul className="divide-y divide-slate-100 border-y border-slate-100">
            {links.map((link) => {
              const directParticipants = nodes.filter(
                (node) => node.id === link.from || node.id === link.to
              );
              const endpoints = directParticipants.length > 1 ? directParticipants : nodes;
              return (
                <li key={link.id} className="py-2.5 text-sm text-slate-700">
                  {endpoints.map((node) => node.label).join(' → ')}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <SourceList sources={sources} />
    </>
  );
}

function mergeSources(...groups: SpecificationSource[][]) {
  return Array.from(new Map(groups.flat().map((source) => [source.number, source])).values());
}

function SourceList({ sources }: { sources: SpecificationSource[] }) {
  if (!sources.length) return null;

  return (
    <section className="mt-7 border-t border-slate-100 pt-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        Спецификации 3GPP
      </h4>
      <ul className="divide-y divide-slate-100">
        {sources.map((source) => (
          <li key={source.number}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="specification-link flex items-start gap-3 py-2 text-sm transition"
            >
              <span className="shrink-0 font-mono text-xs">{source.number}</span>
              <span>{source.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}