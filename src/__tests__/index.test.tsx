import { assert, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TimeAgo, {
  type TimeAgoOptions,
  type TimeAgoProps,
  TimeAgoProvider,
} from "../index.js";

function setup(props: TimeAgoProps) {
  render(
    <div role="main">
      <TimeAgo {...props} />
    </div>
  );
  return screen.getByRole("main");
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
      "renders $date as $output using $roundStrategy",
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
});

describe("TimeAgoProvider", () => {
  function setupWithProvider(
    props: TimeAgoProps,
    providerProps: TimeAgoOptions
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
