# Changelog

## 3.2.0 (2023-08-03)

### Adds

- Adds additional options to the `--starter` flag to make use of the starter kits easier. Also adds fallbacks for obtaining templates from other repositories.
- Changes the `config.js` file to reflect the new name for the old `a3-boilerplate` template repo, `starter-kit-essentials`

## 3.1.2 (2022-09-15)

### Fixes 

- Fixes apostrophe 3 paths in console output.
- Fixed typo in CLI help to clarify install options.

## 3.1.1 (2022-01-10)

### Fixes

- Pinned `package.json` to version `1.4.0` of the `colors` module to ensure the [liberty bug](https://github.com/Marak/colors.js/issues/285) does not corrupt the display. This should not be possible when installing normally with `-g` since we were already shipping a `package-lock.json` that contains 1.4.0, however the bug did occur if a user cloned the repo and ran `npm update`, so in an abundance of caution we are making sure it is not possible even when doing so.

## 3.1.0 (2021-10-14)

### Adds

- Adds a spinner indicator during package install to avoid the impression that the process is failing.

## 3.0.1 (2021-08-03)

- Updates ESLint to v7 to meet the eslint-config-apostrophe peer dependency requirement.

## 3.0.0 (2021-06-16)

- The initial build of the overhauled ApostropheCMS CLI. Uses the `3.0.0` major version number as this is very much an advanced version of the `apostrophe-cli` package (currently at 2.x.x), but moved to a new package name for logistical reasons.
