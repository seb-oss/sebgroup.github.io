---
---

const starsData = {{ site.data.activity | map: "stars" | split: "" }}
const forksData = {{ site.data.activity | map: "forks" | split: "" }}
const openIssuesData = {{ site.data.activity | map: "openIssues" | split: "" }}
const closedIssuesData = {{ site.data.activity | map: "closedIssuesThisMonth" | split: "" }}
const contributorsData = {{ site.data.activity | map: "contributors" | split: "" }}
const activeReposData = {{ site.data.activity | map: "activeProjects" | split: "" }}
const monthsData = {{ site.data.activity | map: "month" | split: "" }}

const monthList = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]
monthList.push(...monthList)

const [twelveMonthsAgo] = monthsData.slice(-12)
const startMonth = monthList.findIndex(
  month => month === twelveMonthsAgo.slice(0, 3)
)
const monthLabels = monthList.slice(startMonth, startMonth + 12)

const starsAndForks = document
  .getElementById('stars-and-forks')
  .getContext('2d')
const starsAndForksChart = new Chart(starsAndForks, {
  type: 'line',
  data: {
    labels: monthLabels,
    datasets: [
      {
        label: 'Stars',
        fill: false,
        borderColor: '#f8a000',
        backgroundColor: '#f8a000',
        data: starsData.slice(-12)
      },
      {
        fill: false,
        label: 'Forks',
        borderColor: '#673ab6',
        backgroundColor: '#673ab6',
        data: forksData.slice(-12)
      }
    ]
  }
})

const openIssues = document.getElementById('open-issues').getContext('2d')
const openIssuesChart = new Chart(openIssues, {
  type: 'bar',
  data: {
    labels: monthLabels,
    datasets: [
      {
        type: 'line',
        label: 'Open Issues',
        fill: false,
        borderColor: '#bb000c',
        backgroundColor: '#bb000c',
        data: openIssuesData.slice(-12)
      },
      {
        label: 'Closed Issues',
        type: 'bar',
        fill: false,
        borderColor: '#007ac7',
        backgroundColor: '#007ac7',
        data: closedIssuesData.slice(-12)
      }
    ]
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            min: 0,
            stepSize: 100,
            max: 300,
          }
        }
      ]
    }
  }
})

const contributors = document.getElementById('contributors').getContext('2d')
const contributorsChart = new Chart(contributors, {
  type: 'line',
  data: {
    labels: monthLabels,
    datasets: [
      {
        label: 'Contributors',
        fill: false,
        borderColor: '#379d00',
        backgroundColor: '#379d00',
        data: contributorsData.slice(-12)
      }
    ]
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            min: 0,
            stepSize: 50,
            max: 100,
          }
        }
      ]
    }
  }
})
const activeRepos = document.getElementById('active-repos').getContext('2d')
const activeReposChart = new Chart(activeRepos, {
  type: 'line',
  data: {
    labels: monthLabels,
    datasets: [
      {
        label: 'Active repositories',
        fill: false,
        borderColor: '#007ac7',
        backgroundColor: '#007ac7',
        data: activeReposData.slice(-12)
      }
    ]
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            min: 0,
            stepSize: 10,
            max: 30,
          }
        }
      ]
    }
  }
})
