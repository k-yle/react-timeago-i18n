import {
  PropsWithChildren,
  createContext,
  createElement,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

type RoundStrategy = "floor" | "round";

function timeSince(
  date: Date,
  roundStrategy: RoundStrategy
): [value: number, unit: Unit] {
  const msAgo = Date.now() - +date;

  for (const [_unit, threshold] of Object.entries(timeUnits)) {
    const unit = _unit as Unit; // TS is stupid
    const value = Math[roundStrategy](msAgo / threshold);
    if (value >= 1) return [value, unit];
  }
  return [0, "seconds"];
}

export type TimeAgoProps = {
  date: Date | string;
  /** the language to use */
  locale?: string;
  /** options for {@link Intl.RelativeTimeFormat} */
  formatOptions?: Intl.RelativeTimeFormatOptions;
  /**
   * If `true`, values smaller than 1 minute will shown as
   * "1 minute" instead of frequently updating seconds.
   */
  hideSeconds?: boolean;
  /**
   * By default, values are `floor`ed (e.g. 23.9 months
   * becomes "1 year"). Is this is not desired, the rounding
   * strategy can be changed to `round` or even `ceil`.
   */
  roundStrategy?: RoundStrategy;
  /**
   * by default, the result is wrapped in an
   * {@link HTMLTimeElement} (`<time>`), with the `title`
   * attribute set to {@link Date.toLocaleString}. If
   * `timeElement` is set to `false`, then the text is
   * returned with no `<time>` element.
   */
  timeElement?: boolean;
};

export type TimeAgoOptions = Omit<TimeAgoProps, "date">;

const Context = createContext<TimeAgoOptions | undefined>(undefined);

/**
 * This context provider allows you specify defaults for
 * all options.
 */
export const TimeAgoProvider: React.FC<TimeAgoOptions & PropsWithChildren> = ({
  children,
  ...props
}) => createElement(Context.Provider, { value: props }, children);

const TimeAgo = memo<TimeAgoProps>(
  //
  (props) => {
    const {
      date,
      locale = navigator.language,
      formatOptions,
      hideSeconds = true,
      roundStrategy = "round",
      timeElement = true,
    } = {
      ...useContext(Context),
      ...props,
    };

    const [text, setText] = useState("");
    const [unit, setUnit] = useState<Unit>();

    const formatter = useMemo(
      () =>
        new Intl.RelativeTimeFormat(locale, {
          localeMatcher: "best fit",
          numeric: "auto",
          style: "long",
          ...formatOptions,
        }),
      [locale, formatOptions]
    );

    const dateObject = useMemo(
      () => (date instanceof Date ? date : new Date(date)),
      [date]
    );

    const doUpdate = useCallback(() => {
      const [value, newUnit] = timeSince(dateObject, roundStrategy);
      setText(
        newUnit === "seconds" && hideSeconds
          ? formatter.format(-1, "minute")
          : formatter.format(-value, newUnit)
      );
      setUnit(newUnit);
      // setUnit is auto-batched with the previous setState,
      // in react 18+, and auto-aborted if this would be a
      // no-op in all react versions.
    }, [dateObject, formatter, hideSeconds, roundStrategy]);

    useEffect(doUpdate, [doUpdate]);

    // the current unit determines how often we need to update
    useEffect(() => {
      if (!unit) return undefined;

      const intervalMs = timeUnits[unit];
      const intervalId = setInterval(doUpdate, intervalMs);
      return () => clearInterval(intervalId);
    }, [unit, doUpdate]);

    return timeElement
      ? createElement(
          "time",
          {
            title: dateObject.toLocaleString(locale),
            dateTime: dateObject.toISOString(),
          },
          text
        )
      : text;
  }
);
TimeAgo.displayName = "TimeAgo";

export default TimeAgo;
