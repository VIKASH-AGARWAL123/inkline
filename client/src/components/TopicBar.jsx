import { TOPICS } from '../utils/topics'

export default function TopicBar({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-6 -mx-1 px-1">
      {TOPICS.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`shrink-0 flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
            active === t.value
              ? 'bg-ink text-paper border-ink'
              : 'border-border hover:border-accent hover:text-accent'
          }`}
        >
          <span>{t.emoji}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  )
}
