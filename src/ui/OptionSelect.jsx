import { useState, useRef, useEffect } from "react";

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

export function OptionSelect({ label, helper, value, onChange, options, id }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((opt) => opt.value === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      {helper && (
        <p className="text-xs text-slate-500">
          {helper}
        </p>
      )}
      <button
        type="button"
        id={id}
        onClick={() => setOpen((prev) => !prev)}
        className={classNames(
          "flex w-full items-center cursor-pointer justify-between rounded-lg border px-3 py-2 text-left text-sm",
          "border-slate-600 bg-slate-800/60 text-slate-100",
          "hover:border-slate-500 hover:bg-slate-800",
          "focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        )}
      >
        <div className="flex flex-col">
          <span className="font-medium">{selected.label}</span>
          {selected.description && (
            <span className="text-xs text-slate-400">{selected.description}</span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={classNames(
            "h-4 w-4 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/95 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
              className={classNames(
                "flex w-full flex-col items-start px-3 py-2 text-left text-sm",
                opt.value === selected.value
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-200 hover:bg-slate-800/70"
              )}
            >
              <span className="font-medium">{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-slate-400">{opt.description}</span>
              )}
              {opt.meta && (
                <span className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                  {opt.meta}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

