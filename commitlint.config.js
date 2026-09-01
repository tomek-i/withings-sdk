/**
 * Conventional Commits, enforced in CI and by the local commit-msg hook.
 *
 * The commit type is what release-please reads to decide the next version, so
 * a wrong type silently produces a wrong release: `feat` bumps the minor,
 * `fix` the patch, and a `!` suffix or a `BREAKING CHANGE:` footer bumps the
 * minor while the package is pre-1.0 (see bump-minor-pre-major).
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Long enough for a descriptive subject, short enough to read in a log.
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [0],
  },
};
