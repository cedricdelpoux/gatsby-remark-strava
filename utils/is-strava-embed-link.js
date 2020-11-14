exports.isStravaEmbedLink = (node) => {
  if (!node.url) {
    return false
  }

  try {
    const {host, pathname} = new URL(node.url)
    const isStravaActivityLink =
      host.includes("strava.com") && pathname.includes("/activities/")
    const isLink = node.type === "link"
    const isEmbedLink =
      node.children.length === 1 &&
      node.children[0].value.toLowerCase().includes("embed")

    return isLink && isEmbedLink && isStravaActivityLink
  } catch (e) {
    return false
  }
}
