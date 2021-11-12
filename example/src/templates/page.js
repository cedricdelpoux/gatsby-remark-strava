import {graphql} from "gatsby"
import React from "react"

const PageIndex = ({data: {page}}) => {
  return <div dangerouslySetInnerHTML={{__html: page.html}} />
}

export default PageIndex

export const pageQuery = graphql`
  query Page($path: String!) {
    page: markdownRemark(fields: {slug: {eq: $path}}) {
      html
    }
  }
`
