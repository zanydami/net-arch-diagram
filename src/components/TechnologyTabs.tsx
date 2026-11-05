import type { Technology } from '../types';

interface Props {
  technologies: Technology[];
  activeId: string;
  onChange: (id: string) => void;
}

export default function TechnologyTabs({ technologies, activeId, onChange }: Props) {
  return (
    <nav className="technology-tabs flex gap-1 overflow-x-auto" aria-label="Выбор технологии">
      {technologies.map((t) => {
        const active = t.id === activeId;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            aria-pressed={active}
            className={`technology-tab whitespace-nowrap${active ? ' is-active' : ''}`}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}