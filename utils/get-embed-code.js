// JSX spells some attributes in camelCase, which HTML does not
exports.getEmbedCode = ({activityId, embedToken, jsx = false}) => {
  const frameBorder = jsx ? "frameBorder" : "frameborder"
  const allowTransparency = jsx ? "allowTransparency" : "allowtransparency"

  return `<iframe height='405' width='590' ${frameBorder}='0' ${allowTransparency}='true' scrolling='no' src='https://www.strava.com/activities/${activityId}/embed/${embedToken}'></iframe>`
}
