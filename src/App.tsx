import { useEffect, useState } from 'react';
import { technologies } from './data/technologies';
import TechnologyTabs from './components/TechnologyTabs';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import DetailPanel from './components/DetailPanel';
import ReferenceDirectory, { type ReferenceSelection } from './components/ReferenceDirectory';
import { parseAppSelection, selectTechnology, serializeAppSelection } from './appState';

const DEFAULT_TECH = '4g';

export default function App() {
  const [techId, setTechId] = useState<string>(DEFAULT_TECH);
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return window.localStorage.getItem('network-diagram-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [directoryRequest, setDirectoryRequest] = useState<{
    technologyId: string;
    selection: ReferenceSelection | null;
  } | null>(null);

  // Read initial state from URL
  useEffect(() => {
    const selection = parseAppSelection(window.location.search, technologies, DEFAULT_TECH);
    setTechId(selection.technologyId);
    setNodeId(selection.nodeId);
  }, []);

  // Sync state to URL
  useEffect(() => {
    window.history.replaceState(null, '', serializeAppSelection(techId, nodeId));
  }, [techId, nodeId]);

  useEffect(() => {
    try {
      window.localStorage.setItem('network-diagram-theme', theme);
    } catch {
      // Theme remains active for this session when storage is unavailable.
    }
  }, [theme]);

  const tech = technologies.find((t) => t.id === techId) ?? technologies[0];
  const selectedNode = nodeId
    ? tech.nodes.find((n) => n.id === nodeId) ?? null
    : null;

  const openDirectory = (selection: ReferenceSelection | null = null) => {
    setDirectoryRequest({ technologyId: techId, selection });
    setDirectoryOpen(true);
  };

  return (
    <div className="app-shell min-h-screen" data-theme={theme}>
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div className="mx-auto max-w-[1800px] px-4 py-3 sm:px-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="brand-mark h-2.5 w-2.5 shrink-0 rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(45,126,116,0.13)]" />
              <h1 className="text-base font-semibold tracking-tight text-slate-800 sm:text-lg">
                Mobile Network Architecture
              </h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => openDirectory()}
                className="directory-trigger shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition"
              >
                Справочник
              </button>
              <div className="theme-switch" role="group" aria-label="Цветовая тема">
                {(['light', 'dark'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={theme === value}
                    onClick={() => setTheme(value)}
                    className={`theme-switch-option${theme === value ? ' is-active' : ''}`}
                  >
                    {value === 'light' ? 'Светлая' : 'Тёмная'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <TechnologyTabs
            technologies={technologies}
            activeId={techId}
            onChange={(id) => {
              const selection = selectTechnology(id);
              setTechId(selection.technologyId);
              setNodeId(selection.nodeId);
            }}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1800px] px-3 py-4 sm:px-5">
        <p className="tech-summary mb-4 max-w-5xl text-sm leading-relaxed text-slate-600">{tech.summary}</p>
        <ArchitectureDiagram
          key={tech.id}
          technology={tech}
          selectedNodeId={nodeId}
          onNodeClick={(id) => setNodeId(id === nodeId ? null : id)}
          onClose={() => setNodeId(null)}
          onShowDetails={(kind, id) => openDirectory({ kind, id })}
        />
      </main>
      <footer className="mx-auto w-full max-w-[1800px] px-5 pb-3 text-center text-[10px]">
        <a
          href="https://github.com/zanydami/net-arch-diagram"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-slate-500 opacity-50 transition duration-200 hover:-translate-y-0.5 hover:text-rose-500 hover:opacity-100 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
        >
          by Danya
          <span aria-hidden="true" className="transition-transform duration-200 hover:scale-110">♥</span>
        </a>
      </footer>
      {directoryOpen && (
        <ReferenceDirectory
          technologies={technologies}
          technologyId={directoryRequest?.technologyId ?? techId}
          initialSelection={directoryRequest?.selection ?? null}
          onClose={() => {
            setDirectoryOpen(false);
            setDirectoryRequest(null);
          }}
        />
      )}
    </div>
  );
}