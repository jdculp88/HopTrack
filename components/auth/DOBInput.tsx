"use client";

/**
 * Date of Birth input — Sprint 156 (Age Verification)
 *
 * Three-dropdown DOB selector for signup. Returns ISO date string.
 * Age gate: user must be 21+ to create a HopTrack account.
 */

interface DOBInputProps {
  value: string; // ISO date string "YYYY-MM-DD" or ""
  onChange: (date: string) => void;
  error?: string | null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDays(): number[] {
  return Array.from({ length: 31 }, (_, i) => i + 1);
}

function getYears(): number[] {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 16;
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }
  return years;
}

const selectStyle: React.CSSProperties = {
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

export function DOBInput({ value, onChange, error }: DOBInputProps) {
  const [month, day, year] = value
    ? [
        parseInt(value.split("-")[1], 10),
        parseInt(value.split("-")[2], 10),
        parseInt(value.split("-")[0], 10),
      ]
    : [0, 0, 0];

  function buildDate(m: number, d: number, y: number) {
    if (m && d && y) {
      const mm = String(m).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      onChange(`${y}-${mm}-${dd}`);
    } else {
      onChange("");
    }
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Date of birth"
        className="grid grid-cols-3 gap-2"
      >
        <select
          aria-label="Birth month"
          value={month || ""}
          onChange={(e) => buildDate(parseInt(e.target.value, 10) || 0, day, year)}
          style={selectStyle}
          className={`w-full rounded-xl px-3 py-3 text-sm focus:outline-none transition-colors appearance-none ${
            error
              ? "!border-[var(--danger)] focus:!border-[var(--danger)]"
              : "focus:border-[var(--accent-gold)]"
          } ${!month ? "text-[var(--text-muted)]" : ""}`}
        >
          <option value="">Month</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>

        <select
          aria-label="Birth day"
          value={day || ""}
          onChange={(e) => buildDate(month, parseInt(e.target.value, 10) || 0, year)}
          style={selectStyle}
          className={`w-full rounded-xl px-3 py-3 text-sm focus:outline-none transition-colors appearance-none ${
            error
              ? "!border-[var(--danger)] focus:!border-[var(--danger)]"
              : "focus:border-[var(--accent-gold)]"
          } ${!day ? "text-[var(--text-muted)]" : ""}`}
        >
          <option value="">Day</option>
          {getDays().map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          aria-label="Birth year"
          value={year || ""}
          onChange={(e) => buildDate(month, day, parseInt(e.target.value, 10) || 0)}
          style={selectStyle}
          className={`w-full rounded-xl px-3 py-3 text-sm focus:outline-none transition-colors appearance-none ${
            error
              ? "!border-[var(--danger)] focus:!border-[var(--danger)]"
              : "focus:border-[var(--accent-gold)]"
          } ${!year ? "text-[var(--text-muted)]" : ""}`}
        >
          <option value="">Year</option>
          {getYears().map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="text-xs mt-1.5 ml-1" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
