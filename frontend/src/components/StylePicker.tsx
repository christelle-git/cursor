import type { StylePreset } from "../types";

interface StylePickerProps {
  styles: StylePreset[];
  selectedStyleId: string | null;
  onSelect: (styleId: string) => void;
}

// Le dégradé de chaque style vient de l'API ("#fromColor,#toColor") et est
// appliqué en style inline plutôt qu'en classes Tailwind, car ces classes ne
// pourraient pas être détectées statiquement par le compilateur Tailwind
// (les valeurs vivent côté backend, pas dans le code source du frontend).
function accentGradient(accent: string): string {
  const [from, to] = accent.split(",");
  return `linear-gradient(135deg, ${from ?? "#888"}, ${to ?? from ?? "#444"})`;
}

export function StylePicker({ styles, selectedStyleId, onSelect }: StylePickerProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-white/80">Style de motion design</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {styles.map((style) => {
          const isSelected = style.id === selectedStyleId;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelect(style.id)}
              className={`group relative overflow-hidden rounded-xl border p-3 text-left transition ${
                isSelected
                  ? "border-white/40 bg-white/[0.06] ring-2 ring-fuchsia-400/60"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
              }`}
            >
              <div
                className="mb-2 h-12 w-full rounded-lg opacity-80 transition group-hover:opacity-100"
                style={{ backgroundImage: accentGradient(style.accent) }}
              />
              <p className="text-sm font-semibold text-white/90">{style.label}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/45">
                {style.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
