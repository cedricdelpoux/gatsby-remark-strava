# 1.5.0

-   Added: **Gatsby v5** compatibility
-   Fixed: Embed not rendering under Gatsby v5 / `gatsby-plugin-mdx` (`mdast-util-to-hast` checks `"children" in node`, so a key merely set to `undefined` still crashed)

# 1.4.0

-   Added: `render` option to customize the embed HTML from the Strava activity

# 1.3.0

-   Added: **Gatsby v4** compatibility

# 1.2.0

-   Added: `debug` option
-   Updated: Handle incorrect URLs

# 1.1.0

-   Updated: Links texts can now contain extra text additional to "embed"

# 1.0.0

-   Added: `gatsby-remark-strava` initial commit
-   Added: `gatsby-remark-strava-token` script for token generation
