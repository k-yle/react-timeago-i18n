# react-timeago-i18n

[![build](https://github.com/k-yle/react-timeago-i18n/actions/workflows/ci.yml/badge.svg)](https://github.com/k-yle/react-timeago-i18n/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/react-timeago-i18n.svg)](https://badge.fury.io/js/react-timeago-i18n)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-timeago-i18n)

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
| `hideSeconds`   | By default, values smaller than 1 minute will shown as "1 minute" instead of frequently updating seconds, unless you set this property to `false`.                   | `true`               |
| `roundStrategy` | By default, values are `rounded`ed (e.g. 11.9 months becomes "2 years"). If this is not desired, the rounding strategy can be changed to `floor`.                    | `"round"`            |
| `timeElement`   | By default, the result is wrapped in `<time title="..."> ... </time>`, unless you set this property to `false`                                                       | `true`               |

## Context Provider

Options can be specified as props, or using a context provider.

For example:

```tsx
import TimeAgo, { TimeAgoProvider } from "react-timeago-i18n";

<TimeAgoProvider locale="zh-Hans" hideSeconds>
  ...
  <TimeAgo date="2019-07-16" />
  ...
</TimeAgoProvider>;
```
