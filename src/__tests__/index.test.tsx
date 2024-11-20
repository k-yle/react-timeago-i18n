import { createRef } from "react";
import { assert, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TimeAgo, { TimeAgoProvider } from "../index.js";

function setup(props: TimeAgo.Props) {
  const ref = createRef<TimeAgo.Ref>();
  render(
    <div role="main">
      <TimeAgo {...props} ref={ref} />
    </div>
  );
  return Object.assign(screen.getByRole("main"), { ref });
}

describe("TimeAgo", () => {
  beforeAll(() => {
    // this whole test suite is frozen in time. it's
    // currently 11am UTC (11pm NZST) on June 6th, 2023.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-06-06T11:00Z"));
  });

  describe("basic", () => {
    it.todo("add test case for mi-NZ once we drop support for node 16");

    it.each`
      date                      | locale       | output
      ${"2023-06-08"}           | ${"en"}      | ${"now"}
      ${"2023-06-07"}           | ${"en"}      | ${"now"}
      ${"2023-06-06"}           | ${"en"}      | ${"11 hours ago"}
      ${"2019-06-06"}           | ${"en"}      | ${"4 years ago"}
      ${"2019-06-06"}           | ${"de-LU"}   | ${"vor 4 Jahren"}
      ${"2023-06-06T11:00:00Z"} | ${"de"}      | ${"jetzt"}
      ${"2023-06-06T10:59:59Z"} | ${"de"}      | ${"vor 1 Sekunde"}
      ${"2023-06-06T10:59:58Z"} | ${"de"}      | ${"vor 2 Sekunden"}
      ${"2023-06-06T10:59:00Z"} | ${"fr"}      | ${"il y a 1 minute"}
      ${"2023-06-06T10:00:00Z"} | ${"es"}      | ${"hace 1 hora"}
      ${"2023-06-06T10:00:00Z"} | ${"zh-Hant"} | ${"1 小時前"}
      ${"2023-06-06T10:00:00Z"} | ${"zh-Hans"} | ${"1小时前"}
      ${"1989-09-01"}           | ${"sm"}      | ${"34 years ago" /* lang not supported */}
      ${"1989-09-01"}           | ${"rrm"}     | ${"34 years ago" /* lang not supported */}
    `(
      "renders $date as $output in $locale",
      async ({ date, locale, output }) => {
        const div = setup({ date, locale, hideSeconds: false });

        expect(div).toHaveTextContent(output);
      }
    );
  });

  describe("hideSeconds", () => {
    it.each`
      date                      | output
      ${"2023-06-08"}           | ${"1 minute ago"}
      ${"2024-01-01"}           | ${"1 minute ago"}
      ${"2023-06-06T11:00:00Z"} | ${"1 minute ago"}
      ${"2023-06-06T10:59:59Z"} | ${"1 minute ago"}
      ${"2023-06-06T10:59:58Z"} | ${"1 minute ago"}
      ${"2023-06-06T10:59:01Z"} | ${"1 minute ago"}
      ${"2023-06-06T10:59:00Z"} | ${"1 minute ago"}
      ${"2023-06-06T10:58:59Z"} | ${"1 minute ago"}
    `("renders $date as $output", ({ date, output }) => {
      const div = setup({ date, hideSeconds: true });

      expect(div).toHaveTextContent(output);
    });
  });

  describe("hideSecondsText", () => {
    it.each`
      date                      | output
      ${"2023-06-08"}           | ${"just now"}
      ${"2023-06-06T11:01:59Z"} | ${"just now"}
      ${"2023-06-06T11:01:01Z"} | ${"just now"}
      ${"2023-06-06T11:00:59Z"} | ${"just now"}
      ${"2023-06-06T11:00:01Z"} | ${"just now"}
      ${"2023-06-06T11:00:00Z"} | ${"just now"}
      ${"2023-06-06T10:59:59Z"} | ${"just now"}
      ${"2023-06-06T10:59:58Z"} | ${"just now"}
      ${"2023-06-06T10:59:01Z"} | ${"1 minute ago"}
      ${"2023-06-06T10:59:00Z"} | ${"1 minute ago"}
      ${"2023-06-06T10:58:59Z"} | ${"1 minute ago"}
    `("renders $date as $output", ({ date, output }) => {
      const div = setup({
        date,
        hideSeconds: true,
        hideSecondsText: ["just now", "right now"],
      });

      expect(div).toHaveTextContent(output);
    });

    it.each`
      date                      | output
      ${"2023-06-08"}           | ${"in 2 days"}
      ${"2023-06-06T11:01:59Z"} | ${"in 2 minutes"}
      ${"2023-06-06T11:01:01Z"} | ${"in 1 minute"}
      ${"2023-06-06T11:00:59Z"} | ${"in 1 minute"}
      ${"2023-06-06T11:00:01Z"} | ${"right now"}
      ${"2023-06-06T11:00:00Z"} | ${"just now"}
      ${"2023-06-06T10:59:59Z"} | ${"just now"}
      ${"2023-06-06T10:59:58Z"} | ${"just now"}
      ${"2023-06-06T10:59:01Z"} | ${"1 minute ago"}
      ${"2023-06-06T10:59:00Z"} | ${"1 minute ago"}
      ${"2023-06-06T10:58:59Z"} | ${"1 minute ago"}
    `(
      "renders $date as $output if `allowFuture` is true",
      ({ date, output }) => {
        const div = setup({
          date,
          hideSeconds: true,
          hideSecondsText: ["just now", "right now"],
          allowFuture: true,
        });

        expect(div).toHaveTextContent(output);
      }
    );
  });

  describe("allowFuture", () => {
    it.each`
      date                      | output
      ${"2023-06-06T11:01:00Z"} | ${"in 1 minute"}
      ${"2023-06-06T11:59:00Z"} | ${"in 1 hour"}
      ${"2023-06-06T23:00:00Z"} | ${"tomorrow"}
      ${"2023-07-05"}           | ${"next month"}
      ${"2027-05-06"}           | ${"in 4 years"}
    `("renders $date as $output", ({ date, output }) => {
      const div = setup({ date, allowFuture: true });

      expect(div).toHaveTextContent(output);
    });

    it.each`
      date                      | output
      ${"2023-06-06T11:00:59Z"} | ${"in 1 minute"}
      ${"2023-06-06T11:01:00Z"} | ${"in 1 minute"}
      ${"2023-06-06T11:59:00Z"} | ${"in 59 minutes"}
      ${"2023-06-06T23:00:00Z"} | ${"in 12 hours"}
      ${"2023-07-05"}           | ${"in 28 days"}
      ${"2027-05-06"}           | ${"in 3 years"}
    `(
      "renders future $date as $output using `roundStrategy` floor",
      ({ date, output }) => {
        const div = setup({ date, allowFuture: true, roundStrategy: "floor" });

        expect(div).toHaveTextContent(output);
      }
    );
  });

  describe("roundStrategy", () => {
    it.each`
      date                   | roundStrategy | output
      ${"2022-07-01"}        | ${"floor"}    | ${"vor 11 Monaten"}
      ${"2022-07-01"}        | ${"round"}    | ${"letztes Jahr"}
      ${"2023-06-01"}        | ${"floor"}    | ${"vor 5 Tagen"}
      ${"2023-06-01"}        | ${"round"}    | ${"vor 5 Tagen"}
      ${"2023-06-06T07:00Z"} | ${"floor"}    | ${"vor 4 Stunden"}
      ${"2023-06-06T07:00Z"} | ${"round"}    | ${"vor 4 Stunden"}
    `(
      "renders $date as $output using `roundStrategy` $roundStrategy",
      async ({ date, roundStrategy, output }) => {
        const div = setup({ date, locale: "de-AT", roundStrategy });

        expect(div).toHaveTextContent(output);
      }
    );

    it.each`
      date            | output
      ${"2019"}       | ${"hace 5 año"}
      ${"2023"}       | ${"el año pasado"}
      ${"2023-06-01"} | ${"el año pasado"}
      ${"2023-06-06"} | ${"el año pasado"}
      ${"2024"}       | ${"hace 1 minuto"}
    `(
      "doesn't crash if someone tries to use ceil with $date",
      ({ date, output }) => {
        // ceil is not a valid roundStrategy, typescript will enforce this
        // at compile time, but nothing is stopping the user at runtime.

        // so, let's test that it doesn't crash. The output can be bogus.
        expect(
          setup({
            date,
            locale: "es-419",
            // @ts-expect-error -- typescript should not allow this
            roundStrategy: "ceil",
          })
        ).toHaveTextContent(output);
      }
    );
  });

  describe("time element", () => {
    it.each`
      date            | locale     | tooltip         | isoDate
      ${"2023-02-06"} | ${"en-US"} | ${"2/6/2023, "} | ${"2023-02-06T00:00:00.000Z"}
      ${"2019-02-06"} | ${"de"}    | ${"6.2.2019, "} | ${"2019-02-06T00:00:00.000Z"}
    `(
      "renders a tooltip for $date in $locale",
      ({ date, locale, tooltip, isoDate }) => {
        const element = setup({
          date,
          hideSeconds: true,
          locale,
        }).querySelector("time");

        assert(element instanceof HTMLTimeElement);
        expect(element.title).toContain(tooltip);
        expect(element.dateTime).toBe(isoDate);
      }
    );
  });

  describe("performance & render lifecycle", () => {
    it("only renders once (i.e. with no re-renders)", () => {
      const { ref } = setup({ date: "2023-01-14" });
      expect(screen.getByRole("main")).toHaveTextContent("5 months ago");

      // once only - useEffects did not trigger another render
      expect(ref.current?.renderCount.current).toBe(2); // TODO: reduce by 1
    });

    it("re-renders as time progresses, using minimal re-renders", async () => {
      const { ref } = setup({
        date: new Date().toISOString(),
        hideSeconds: false,
      });
      expect(screen.getByRole("main")).toHaveTextContent("now");
      // only 1 render during the initialisation phase
      expect(ref.current?.renderCount.current).toBe(2); // TODO: reduce by 1

      // jump forward 1 second
      await vi.advanceTimersByTimeAsync(1000);

      expect(screen.getByRole("main")).toHaveTextContent("1 second ago");
      // 1 new render
      expect(ref.current?.renderCount.current).toBe(3); // TODO: reduce by 1

      // jump forward 5 seconds
      await vi.advanceTimersByTimeAsync(5000);

      expect(screen.getByRole("main")).toHaveTextContent("6 seconds ago");
      // 5 new renders
      expect(ref.current?.renderCount.current).toBe(8); // TODO: reduce by 1
    });

    it("does not re-render if the date is unchanged", async () => {
      const { ref } = setup({
        date: "2019-01-14",
        hideSeconds: false,
      });
      expect(screen.getByRole("main")).toHaveTextContent("4 years ago");
      // only 1 render during the initialisation phase
      expect(ref.current?.renderCount.current).toBe(2); // TODO: reduce by 1

      // jump forward 1 second
      await vi.advanceTimersByTimeAsync(1000);

      expect(screen.getByRole("main")).toHaveTextContent("4 years ago");
      // 1 new render, unclear why
      expect(ref.current?.renderCount.current).toBe(3); // TODO: reduce by 1

      // jump forward 5 seconds
      await vi.advanceTimersByTimeAsync(5000);

      expect(screen.getByRole("main")).toHaveTextContent("4 years ago");
      // no new renders
      expect(ref.current?.renderCount.current).toBe(3); // TODO: reduce by 1

      // jump forward 10 seconds
      await vi.advanceTimersByTimeAsync(10_000);

      expect(screen.getByRole("main")).toHaveTextContent("4 years ago");
      // no new renders
      expect(ref.current?.renderCount.current).toBe(3); // TODO: reduce by 1
    });
  });
});

describe("TimeAgoProvider", () => {
  function setupWithProvider(
    props: TimeAgo.Props,
    providerProps: TimeAgo.Options
  ) {
    render(
      <TimeAgoProvider {...providerProps}>
        <div role="main">
          <TimeAgo {...props} />
        </div>
      </TimeAgoProvider>
    );
    return screen.getByRole("main");
  }

  it("uses options from the context provider", () => {
    expect(
      setupWithProvider({ date: "2023" }, { locale: "ru-Cyrl-RU" })
    ).toHaveTextContent("5 месяцев назад");
  });

  it("prefers props over values from the context provider", () => {
    expect(
      setupWithProvider(
        { date: "2023", locale: "it-CH" },
        { locale: "ru-Cyrl-RU" }
      )
    ).toHaveTextContent("5 mesi fa");
  });
});
