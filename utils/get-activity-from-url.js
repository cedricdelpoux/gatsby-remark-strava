const stravaActivityRegex = /^https:\/\/www.strava.com\/activities\/([0-9]*)$/

exports.getActivityFromUrl = (url) => {
  const match = url.match(stravaActivityRegex)

  if (match) {
    return match[1]
  }

  return null
}
