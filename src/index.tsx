import { memo, useCallback, useEffect, useMemo, useState } from "react";

// all JS environments that support the Intl API guarantee
// deterministic object ordering.
const timeUnits = {
  years: 1000 * 60 * 60 * 24 * 365,
  months: 1000 * 60 * 60 * 24 * 30,
  days: 1000 * 60 * 60 * 24,
  hours: 1000 * 60 * 60,
  minutes: 1000 * 60,
  seconds: 1000,
} satisfies Partial<Record<Intl.RelativeTimeFormatUnit, number>>;

type Unit = keyof typeof timeUnits;

function timeSince(date: Date): [value: number, unit: Unit] {
  const msAgo = Date.now() - +date;

  for (const [_unit, threshold] of Object.entries(timeUnits)) {
    const unit = _unit as Unit; // TS is stupid
    const value = Math.floor(msAgo / threshold);
    if (value >= 1) return [value, unit];
  }
  return [0, "seconds"];
}

export type TimeAgoProps = {
  date: Date | string;
  locale?: string;
  formatOptions?: Intl.RelativeTimeFormatOptions;
  hideSeconds?: boolean;
};

const TimeAgo = memo<TimeAgoProps>(
  ({ date, locale = navigator.language, formatOptions, hideSeconds }) => {
    const [text, setText] = useState("");
    const [unit, setUnit] = useState<Unit>();

    const formatter = useMemo(
      () =>
        new Intl.RelativeTimeFormat(locale, {
          localeMatcher: "best fit",
          numeric: "always",
          style: "long",
          ...formatOptions,
        }),
      [locale, formatOptions]
    );

    const doUpdate = useCallback(() => {
      const dateObject = date instanceof Date ? date : new Date(date);

      const [value, newUnit] = timeSince(dateObject);
      setText(
        newUnit === "seconds" && hideSeconds
          ? formatter.format(-1, "minute")
          : formatter.format(-value, newUnit)
      );
      setUnit(newUnit);
      // setUnit is auto-batched with the previous setState,
      // in react 18+, and auto-aborted if this would be a
      // no-op in all react versions.
    }, [date, formatter, hideSeconds]);

    useEffect(() => doUpdate, [doUpdate]);

    // the current unit determines how often we need to update
    useEffect(() => {
      if (!unit) return undefined;

      const intervalMs = timeUnits[unit];
      const intervalId = setInterval(doUpdate, intervalMs);
      return () => clearInterval(intervalId);
    }, [unit, doUpdate]);

    // avoid using a JSX fragment to keep things simple
    return text as never as React.ReactElement;
  }
);
TimeAgo.displayName = "TimeAgo";

export default TimeAgo;
