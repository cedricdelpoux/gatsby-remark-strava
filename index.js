const visit = require("unist-util-visit")

const {isStravaEmbedLink} = require("./utils/is-strava-embed-link")
const {strava} = require("./utils/strava.js")
const {getEmbedCode} = require("./utils/get-embed-code.js")
const {getActivityFromUrl} = require("./utils/get-activity-from-url.js")

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

      stravaElements.push(node)
    })

    await Promise.all(
      stravaElements.map(async (node) => {
        try {
          let html = await cache.get(node.url)

          if (!html) {
            const activityId = getActivityFromUrl(node.url)
            const activity = await strava.getActivity(activityId)
            const {embed_token: embedToken} = activity

            if (pluginOptions.render) {
              html = pluginOptions.render(activity)
            } else {
              html = getEmbedCode({activityId, embedToken})
            }

            await cache.set(node.url, html)
          }

          node.type = `html`
          node.value = html
          node.children = undefined

          if (pluginOptions.debug) {
            reporter.success(`remark-strava: EMBED OK ${node.url}`)
          }
        } catch (e) {
          if (pluginOptions.debug) {
            reporter.warn(`remark-strava: EMBED NOK ${node.url}`)
          }
        }
      })
    )
  } catch (e) {
    reporter.warn(`remark-strava: ${e.message}`)
  }

  return markdownAST
}
