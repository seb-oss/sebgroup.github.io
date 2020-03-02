const fs = require('fs')
const datefns = require('date-fns')
const { projects, contributors, closedIssuesThisMonth } = readProjectsFile()

const stars = projects
  .map(e => e.stargazers)
  .reduce((sum, curr) => sum + curr, 0)

const forks = projects
  .map(e => e.forkCount)
  .reduce((sum, curr) => sum + curr, 0)

const openIssues = projects
  .map(e => e.openIssues)
  .reduce((sum, curr) => sum + curr, 0)

const activeProjects = getActiveProjectsCount()

appendToActivityFile({
  stars,
  forks,
  openIssues,
  closedIssuesThisMonth,
  activeProjects,
  contributors,
  month: datefns.format(datefns.subMonths(new Date(), 1), 'MMMM'),
  year: datefns.getYear(new Date())
})

function getActiveProjectsCount() {
  const end = new Date()
  const start = datefns.sub(end, { days: 31 })
  const monthInterval = datefns.eachMonthOfInterval({ start, end })
  const isWithinLastMonth = date =>
    datefns.isWithinInterval(datefns.parseISO(date), {
      start: monthInterval[monthInterval.length - 2],
      end: monthInterval[monthInterval.length - 1]
    })

  return projects.filter(
    e =>
      isWithinLastMonth(e.pushedAt) || isWithinLastMonth(e.lastIssueCreatedAt)
  ).length
}

function appendToActivityFile(activity) {
  const activityList = readActivityFile() || []
  activityList.push(activity)
  fs.writeFileSync(
    '../_data/activity.json',
    JSON.stringify(activityList, null, 2)
  )
}

function readProjectsFile() {
  return JSON.parse(
    fs.readFileSync('../_data/projects.json', { encoding: 'utf-8' })
  )
}

function readActivityFile() {
  const path = '../_data/activity.json'
  if (!fs.existsSync(path)) {
    return []
  }
  return JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }))
}
