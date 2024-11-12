# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Use a TypeScript namespace for all type defintions
- Performance improvements

## 2.2.1 (2024-06-19)

- Republish to npm due to EINTEGRITY error

## 2.2.0 (2024-06-16)

- Added a new option: `allowFuture`, to support dates in the future.
- Added a new option: `hideSecondsText`, for providing a custom message when `hideSeconds=true`
- Added react v19 to `peerDependencies`

## 2.1.1 (2024-02-26)

- Remove internal properties from [package.json](./package.json)

## 2.1.0 (2024-02-23)

- Support old versions of react (pre v16.14)
- Prefer idiomatic phrasing by default (use `numeric: 'always'` for the old behaviour)
- Added a context provider to allow default options to be specified

## 2.0.0 (2024-02-09)

- 💥 BREAKING CHANGE: Enable `hideSeconds` by default
- 💥 BREAKING CHANGE: Set `roundStrategy` to `round` by default
- 💥 BREAKING CHANGE: Wrap output in `<time>...</time>` by default.
- Add `timeElement` option to determine whether a `<time>` element should be used.

## 1.1.0 (2023-07-07)

- Add `roundStrategy` option

## 1.0.1 (2023-05-23)

- Fix bug in `hideSeconds` mode

## 1.0.0 (2023-05-18)

- Initial release
