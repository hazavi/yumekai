"use client";
import { useState } from "react";

interface ToggleOption<T extends string> { value: T; label: string; }
interface ToggleGroupProps<T extends string> {
  options: ToggleOption<T>[];
  defaultValue: T;
  onChange?: (value: T) => void;
}

export function ToggleGroup<T extends string>({ options, defaultValue, onChange }: ToggleGroupProps<T>) {
  const [active, setActive] = useState<T>(defaultValue);
  return (
    <div className="inline-flex gap-2 p-1 glass rounded-full relative">
      {options.map(opt => {
        const isActive = opt.value === active;
        return (
          <button
            key={opt.value}
            onClick={() => { setActive(opt.value); onChange?.(opt.value); }}
            className={`relative px-5 py-2 rounded-full text-sm font-medium tracking-wide transition focus:outline-none ${isActive ? "text-white" : "text-white/60 hover:text-white"}`}
            type="button"
          >
            {isActive && (
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-600/40 to-sky-500/40 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.1)] animate-glow" />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
