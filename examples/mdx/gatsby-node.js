const {resolve} = require("path")

const {createFilePath} = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({node, getNode, actions}) => {
  const {createNodeField} = actions
  if (node.internal.type === "Mdx") {
    createNodeField({
      node,
      name: "slug",
      value: createFilePath({
        node,
        getNode,
      }),
    })
  }
}

exports.createPages = async ({graphql, actions: {createPage}, reporter}) => {
  const result = await graphql(
    `
      {
        allMdx {
          nodes {
            fields {
              slug
            }
            internal {
              contentFilePath
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    reporter.panic(result.errors)
  }

  const {allMdx} = result.data

  if (allMdx) {
    allMdx.nodes.forEach(({fields: {slug}, internal: {contentFilePath}}) => {
      createPage({
        path: slug,
        component: `${resolve(
          "src/templates/page.js"
        )}?__contentFilePath=${contentFilePath}`,
      })
    })
  }
}
