const { GraphQLClient } = require("graphql-request")
const fs = require("fs")

const client = new GraphQLClient("https://api.github.com/graphql", {
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
})

function getProjects() {
  const query = `{
        organization(login: "sebgroup") {
            repositories(first: 100 isFork: false) {
                edges {
                    node {
                        name
                        description
                        homepageUrl
                        url
                        pushedAt
                        isArchived
                        forkCount
                        issues(states: CLOSED) {
                          totalCount
                        }
                        primaryLanguage {
                            name
                            color
                        }
                        stargazers {
                            totalCount
                        }
                    }
                }
            }
        }
    }`

  client
    .request(query)
    .then(e => e.organization.repositories.edges)
    .then(graphQLToJson)
    .then(writeToProjectsFile)
}

function writeToProjectsFile(projects) {
  fs.writeFileSync("../_data/projects.json", JSON.stringify(projects, null, 2))
}

function graphQLToJson(body) {
  return body
    .map(e => e.node)
    .map(e => Object.assign({}, e, { issues: e.issues.totalCount }))
    .map(e => Object.assign({}, e, { stargazers: e.stargazers.totalCount }))
    .filter(e => !e.isArchived)
    .filter(e => !e.isPrivate)
    .map(
      ({
        name,
        description,
        homepageUrl,
        url,
        pushedAt,
        primaryLanguage,
        stargazers,
        forkCount,
        issues
      }) => ({
        name,
        description: description || null,
        homepageUrl: homepageUrl || null,
        url,
        pushedAt,
        primaryLanguage: primaryLanguage || null,
        stargazers,
        forkCount,
        closedIssues: issues
      })
    )
    .sort(
      ({ stargazers: stargazers1 }, { stargazers: stargazers2 }) =>
        stargazers2 - stargazers1
    )
}

function getToken() {
  return (
    process.env.GITHUB_TOKEN ||
    fs.readFileSync(".env", { encoding: "utf-8" }).split("TOKEN=")[1]
  )
}

getProjects()
