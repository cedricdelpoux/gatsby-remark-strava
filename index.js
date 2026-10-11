const visit = require("unist-util-visit")

const {isStravaEmbedLink} = require("./utils/is-strava-embed-link")
const {strava} = require("./utils/strava.js")
const {getEmbedCode} = require("./utils/get-embed-code.js")
const {getActivityFromUrl} = require("./utils/get-activity-from-url.js")

const OUTPUTS = ["html", "mdx"]

// Markdown treats 4+ leading spaces of indentation as an indented code block,
// which swallows multi-line JSX (typically `render()` output indented by a
// template literal) instead of parsing it as an element. Dedent before parsing.
const dedent = (markup) => markup.replace(/^[ \t]+/gm, "").trim()

// These packages are ESM only, and only needed for the "mdx" output
const parseAsJsxNode = async (markup) => {
  const {fromMarkdown} = await import("mdast-util-from-markdown")
  const {mdxJsx} = await import("micromark-extension-mdx-jsx")
  const {mdxJsxFromMarkdown} = await import("mdast-util-mdx-jsx")

  const tree = fromMarkdown(dedent(markup), {
    extensions: [mdxJsx()],
    mdastExtensions: [mdxJsxFromMarkdown()],
  })
  const [jsxNode] = tree.children

  if (!jsxNode || jsxNode.type !== "mdxJsxFlowElement") {
    throw new Error("The markup is not a single JSX element")
  }

  // Its position points into the markup, not into the document
  delete jsxNode.position

  return jsxNode
}

// Replaces the node in place, so that its parent keeps pointing to it
const replaceNode = (node, newNode) => {
  Object.keys(node).forEach((key) => delete node[key])
  Object.assign(node, newNode)
}

module.exports = async ({markdownAST, cache, reporter}, pluginOptions) => {
  if (!pluginOptions.stravaClientId) {
    reporter.warn("remark-strava: Missing `stravaClientId` option")
    return
  }

  if (!pluginOptions.stravaClientSecret) {
    reporter.warn("remark-strava: Missing `stravaClientSecret` option")
    return
  }

  if (!pluginOptions.stravaToken) {
    reporter.warn("remark-strava: Missing `stravaToken` option")
    return
  }

  const output = pluginOptions.output || "html"

  if (!OUTPUTS.includes(output)) {
    reporter.warn(
      `remark-strava: Invalid \`output\` option "${output}", expected one of: ${OUTPUTS.join(
        ", "
      )}`
    )
    return
  }

  try {
    await strava.init({
      clientId: pluginOptions.stravaClientId,
      clientSecret: pluginOptions.stravaClientSecret,
      token: pluginOptions.stravaToken,
    })

    const stravaElements = []

    visit(markdownAST, "paragraph", (paragraphNode) => {
      if (paragraphNode.children.length !== 1) {
        return
      }

      const [node] = paragraphNode.children

      if (!isStravaEmbedLink(node)) {
        return
      }

      stravaElements.push({paragraphNode, node})
    })

    await Promise.all(
      stravaElements.map(async ({paragraphNode, node}) => {
        const {url} = node
        // The markup differs between outputs, so they must not share a cache
        // entry. The "html" one keeps the key used before this option.
        const cacheKey = output === "html" ? url : `${output}:${url}`

        try {
          let markup = await cache.get(cacheKey)

          if (!markup) {
            const activityId = getActivityFromUrl(url)
            const activity = await strava.getActivity(activityId)
            const {embed_token: embedToken} = activity

            if (pluginOptions.render) {
              markup = pluginOptions.render(activity)
            } else {
              markup = getEmbedCode({
                activityId,
                embedToken,
                jsx: output === "mdx",
              })
            }
          }

          if (output === "mdx") {
            // The JSX element replaces the whole paragraph, because a <div>
            // returned by `render()` cannot sit inside a <p>
            replaceNode(paragraphNode, await parseAsJsxNode(markup))
          } else {
            node.type = `html`
            node.value = markup
            delete node.children
          }

          // Only once the markup is known to work, so that a broken one is
          // fetched again on the next build
          await cache.set(cacheKey, markup)

          if (pluginOptions.debug) {
            reporter.success(`remark-strava: EMBED OK ${url}`)
          }
        } catch (e) {
          // Not cached, so the next build tries again. The link stays a link
          // meanwhile.
          reporter.warn(`remark-strava: EMBED NOK ${url}: ${e.message}`)
        }
      })
    )
  } catch (e) {
    reporter.warn(`remark-strava: ${e.message}`)
  }

  return markdownAST
}
