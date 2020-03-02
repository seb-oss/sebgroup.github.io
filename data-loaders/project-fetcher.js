const { GraphQLClient } = require('graphql-request')
const fs = require('fs')
const fetch = require('node-fetch')
const datefns = require('date-fns')

const client = new GraphQLClient('https://api.github.com/graphql', {
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
                        openIssues: issues(states: OPEN) {
                          totalCount
                        }
                        lastIssue: issues(last: 1) {
                          nodes {
                            createdAt
                          }
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
    .then(appendNoOfContributors)
    .then(appendNoOfIssuesClosed)
    .then(writeToProjectsFile)
}

async function appendNoOfContributors(projects) {
  const projectsWithContributors = await Promise.all(
    projects
      .map(project =>
        fetch(
          `https://api.github.com/repos/SEBgroup/${project.name}/stats/contributors`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        )
        .then(res => res.json())
        .then(data => ({
          ...project,
          contributors: data.length
        }))
      )
  )

  return {
    contributors: projectsWithContributors
      .map(e => e.contributors)
      .filter(Boolean)
      .reduce((sum, curr) => sum + curr, 0),
    projectsWithContributors
  }
}

async function appendNoOfIssuesClosed(projects) {
  const end = new Date()
  const start = datefns.sub(end, { days: 31 })
  const [_, endOfLastMonth] = datefns.eachMonthOfInterval({ start, end })

  return {
    closedIssuesThisMonth: await getClosedIssuesAfterDate(endOfLastMonth),
    ...projects
  }
}

function writeToProjectsFile(projects) {
  fs.writeFileSync('../_data/projects.json', JSON.stringify(projects, null, 2))
}

function graphQLToJson(body) {
  return body
    .map(e => e.node)
    .map(e => Object.assign({}, e, { openIssues: e.openIssues.totalCount }))
    .map(e => {
      if (!e.lastIssue.nodes[0]) {
        return e
      }
      return Object.assign({}, e, {
        lastIssueCreatedAt: e.lastIssue.nodes[0].createdAt
      })
    })
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
        openIssues,
        lastIssueCreatedAt
      }) => ({
        name,
        description: description || null,
        homepageUrl: homepageUrl || null,
        url,
        pushedAt,
        primaryLanguage: primaryLanguage || null,
        stargazers,
        forkCount,
        openIssues,
        lastIssueCreatedAt
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
    fs.readFileSync('.env', { encoding: 'utf-8' }).split('TOKEN=')[1]
  )
}

function getClosedIssuesAfterDate(date) {
  const formattedDate = datefns.format(datefns.subHours(date, 6), 'yyyy-MM-dd')
  const query = `{
    search (query:"org:sebgroup is:issue is:closed is:public closed:>${formattedDate}" type:ISSUE) {
      issueCount
    }
  }`

  return client.request(query).then(data => data.search.issueCount)
}

getProjects()
