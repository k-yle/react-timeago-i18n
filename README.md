# react-timeago-i18n

📅🌏 A tiny relative time component for react, which uses the browser's native [`Intl.RelativeTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat) API.
This means that all languages are supported without bundling translations.

This library is `0.8 kB`, which is significantly smaller than `react-timeago` which is `96 kB`.

## Install

```sh
npm install react-timeago-i18n
```

## Usage

```tsx
import TimeAgo from "react-timeago-i18n";

<TimeAgo date="2019-07-16" /> // --> "4 years ago"
<TimeAgo date="2019-07-16" locale="de-AT" /> // --> "vor 4 Jahren"
```

## Props

| Property        | Description                                                                                                                                                          | Default Value        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `date`          | `string` or `Date`                                                                                                                                                   | -                    |
| `locale`        | the language to use                                                                                                                                                  | `navigator.language` |
| `formatOptions` | [options for `Intl.RelativeTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat#basic_format_usage) | `undefined`          |
| `hideSeconds`   | If `true`, values smaller than 1 minute will shown as "1 minute" instead of frequently updating seconds.                                                             | `false`              |
