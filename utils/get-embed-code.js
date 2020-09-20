exports.getEmbedCode = ({activityId, embedToken}) => {
  return `<iframe height='405' width='590' frameborder='0' allowtransparency='true' scrolling='no' src='https://www.strava.com/activities/${activityId}/embed/${embedToken}'></iframe>`
}
