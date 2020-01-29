const { GraphQLClient } = require('graphql-request')
const fs = require('fs')
const token = process.env.GITHUB_TOKEN

const client = new GraphQLClient('https://api.github.com/graphql', {
    headers: {
        Authorization: `Bearer ${token}`
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
    fs.writeFileSync('../_data/projects.json', JSON.stringify(projects, null, 2))
}

function graphQLToJson(body) {
    return body
        .map(e => e.node)
        .map(e => Object.assign({}, e, {stargazers: e.stargazers.totalCount}))
        .filter(e => !e.isArchived)
        .filter(e => !e.isPrivate)
        .map(({name, description, homepageUrl, url, pushedAt, primaryLanguage, stargazers}) => ({
            name, 
            description,
            homepageUrl,
            url,
            pushedAt,
            primaryLanguage,
            stargazers
        }))
}

getProjects()