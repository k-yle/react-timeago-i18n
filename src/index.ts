import {
  PropsWithChildren,
  createContext,
  createElement,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

type Unit = Intl.RelativeTimeFormatUnitSingular;

const timeUnits: Map<Unit, number> = new Map([
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
  ["second", 1000],
]);

type RoundStrategy = "floor" | "round";

function timeSince(
  date: Date,
  roundStrategy: RoundStrategy,
  allowFuture: boolean
): [value: number, unit: Unit] {
  const msAgo = Date.now() - +date;

  if (!allowFuture && msAgo < 0) {
    // If msAgo is negative, the date given is in the future
    return [0, "second"];
  }

  for (const [unit, threshold] of timeUnits.entries()) {
    // Using round strategies on negative numbers has unintuitive results
    // to negate this, we round the absolute (positive) number and modify the sign of the result
    const value = Math[roundStrategy](Math.abs(msAgo) / threshold);
    if (value >= 1) return [value * Math.sign(msAgo), unit];
  }
  return [0, "second"];
}

namespace TimeAgo {
  export type Ref = {
    /** @internal */
    renderCount: React.MutableRefObject<number>;
  };

  export type Props = {
    date: Date | string | number;
    /** the language to use */
    locale?: string | string[];
    /** options for {@link Intl.RelativeTimeFormat} */
    formatOptions?: Intl.RelativeTimeFormatOptions;
    /**
     * If `true` values in the future will also be
     * displayed - e.g. "in 3 days"
     */
    allowFuture?: boolean;
    /**
     * If `true`, values smaller than 1 minute will shown as
     * "1 minute" instead of frequently updating seconds.
     */
    hideSeconds?: boolean;
    /**
     * If hideSeconds is `true`, values smaller than 1 minute
     * will display this custom string, instead of "1 minute"
     *
     * @example ['just now', 'right now']
     */
    hideSecondsText?: [string, string];
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

  export type Options = Omit<Props, "date">;
}

/** @deprecated - use {@link TimeAgo.Props} */
export type TimeAgoProps = TimeAgo.Props;

/** @deprecated - use {@link TimeAgo.Options} */
export type TimeAgoOptions = TimeAgo.Options;

const Context = createContext<TimeAgo.Options | undefined>(undefined);

/**
 * This context provider allows you to specify defaults for
 * all options.
 */
export const TimeAgoProvider: React.FC<TimeAgo.Options & PropsWithChildren> = ({
  children,
  ...props
}) => createElement(Context.Provider, { value: props }, children);

const TimeAgo = memo(
  forwardRef<TimeAgo.Ref, TimeAgo.Props>((props, ref) => {
    // This exists purely for performance-related unit tests. The
    // ref is available at runtime in production, but hidden from
    // the type-definitions because it's not a documented feature.
    const renderCount = useRef(0);
    renderCount.current++;
    useImperativeHandle(ref, () => ({ renderCount }), []);

    const {
      date,
      locale = navigator.languages,
      formatOptions,
      allowFuture = false,
      hideSeconds = true,
      hideSecondsText: [pastSecondsText, futureSecondsText] = [],
      roundStrategy = "round",
      timeElement = true,
    } = {
      ...useContext(Context),
      ...props,
    };

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

    const formatDate = useCallback(
      (value: number, newUnit: Unit): string => {
        if (!hideSeconds || newUnit !== "second") {
          return formatter.format(-value, newUnit);
        }

        if (value < 0) {
          return futureSecondsText ?? formatter.format(1, "minute");
        }
        return pastSecondsText ?? formatter.format(-1, "minute");
      },
      [formatter, hideSeconds, pastSecondsText, futureSecondsText]
    );

    const getValues = useCallback(() => {
      const [value, newUnit] = timeSince(
        dateObject,
        roundStrategy,
        allowFuture
      );
      return {
        text: formatDate(value, newUnit),
        unit: newUnit,
      };
    }, [dateObject, roundStrategy, allowFuture, formatDate]);

    const [text, setText] = useState<string>(() => getValues().text);
    const [unit, setUnit] = useState<Unit>(() => getValues().unit);

    const doUpdate = useCallback(() => {
      setText(getValues().text);
      setUnit(getValues().unit);
      // setUnit is auto-batched with the previous setState,
      // in react 18+, and auto-aborted if this would be a
      // no-op in all react versions.
    }, [getValues]);

    useEffect(doUpdate, [doUpdate]);

    // the current unit determines how often we need to update
    useEffect(() => {
      if (!unit) return undefined;

      const intervalMs = timeUnits.get(unit);
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
  })
);
TimeAgo.displayName = "TimeAgo";

export default TimeAgo;
