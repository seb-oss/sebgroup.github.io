const fs = require("fs")
const datefns = require('date-fns')
function writeToProjectsFile(kpis) {
    fs.writeFileSync("../_data/kpis.json", JSON.stringify(kpis, null, 2))
}

function readToProjectsFile() {
    return JSON.parse(fs.readFileSync("../_data/projects.json", {encoding: "utf-8"}))
}
const projects = readToProjectsFile().projects

const stars = projects.map(e => e.stargazers).reduce((sum, curr) => sum + curr, 0)
const forks = projects.map(e => e.forkCount).reduce((sum, curr) => sum + curr, 0)
const openIssues = projects.map(e => e.openIssues).reduce((sum, curr) => sum + curr, 0)

const activeProjects = getActiveProjectsCount()

function getActiveProjectsCount() {
    const end = new Date()
    const start = datefns.sub(end, {days: 30})
    const monthInterval = datefns.eachMonthOfInterval({start, end})
    const isWithinLastMonth = date =>
        datefns.isWithinInterval(datefns.parseISO(date), {
            start: monthInterval[0],
            end: monthInterval[1]
        })
    return projects.filter(e => isWithinLastMonth(e.pushedAt) || isWithinLastMonth(e.lastIssueCreatedAt)).length
}

writeToProjectsFile([{
    stars,
    forks,
    openIssues,
    activeProjects,
    month: datefns.format(datefns.subMonths(new Date(), 1), "MMMM"),
    year: datefns.getYear(new Date())
}])