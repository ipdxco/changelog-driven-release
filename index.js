const core = require('@actions/core')
const github = require('@actions/github')

const semverRegExp = /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/
const dateRegExp = /(0|\d{4})-(0|\d{2})-(0|\d{2})/
const headerRegExp = new RegExp(`^## \\[${semverRegExp.source}\\] - ${dateRegExp.source}$`)

try {
  core.info('Creating release...')

  const path = core.getInput('path')
  const draft = core.getInput('draft') === 'true'
  core.info(`Path: ${path}`)
  core.info(`Draft: ${draft}`)

  core.info('Getting changelog...')
  let owner, repo, sha
  if (github.context.eventName == 'pull_request') {
    [owner, repo] = github.context.payload.pull_request.head.repo.full_name.split('/')
    sha = github.context.payload.pull_request.head.sha
  } else {
    ({owner, repo}) = github.context.repo
    sha = github.context.sha
  }
  const content = await github.repos.getContent({
    owner,
    repo,
    path
  })
  const changelog = Buffer.from(content.data.content, 'base64').toString()
  core.debug(`Changelog: ${changelog}`)

  core.info('Parsing changelog...')
  let version, body
  for (const line of changelog.split('\n')) {
    if (line.match(headerRegExp)) {
      if (version != null) {
        break
      }
      version = line.match(semverRegExp)
    } else if (version != null) {
      if (body == null) {
        body = line
      } else {
        body += '\n' + line
      }
    }
  }
  const tag = `v${version[0]}`
  core.info(`Version: ${version[0]}`)
  core.info(`Body: ${body}`)
  core.info(`Tag: ${tag}`)

  if (version == null) {
    return
  }

  if (!draft) {
    core.info('Creating tags...')
    const suffix = `${version[4] != null ? '-' + version[4] : ''}${version[5] != null ? '+' + version[5] : ''}`
    const tags = [
      `v${version[1]}.${version[2]}.${version[3]}${suffix}`,
      `v${version[1]}.${version[2]}${suffix}`,
      `v${version[1]}${suffix}`
    ]
    for (const tag of tags) {
      core.info(`Tag: ${tag}`)
      core.info('Listing refs...')
      const refs = octokit.git.listRefs({
        ...github.context.repo,
        ref: `tags/${tag}`
      })
      if (refs.data.length == 0) {
        core.info('Creating ref...')
        await github.git.createRef({
          ...github.context.repo,
          ref: `refs/tags/${tag}`,
          sha
        })
      }
    }
  }

  core.info('Listing releases...')
  const releases = await github.paginate(octokit.rest.repos.listReleases, github.context.repo)
  const release = releases.find(release => release.tag_name === tag)

  if (release != null) {
    if (release.draft !== draft) {
      core.info('Updating release...')
      await github.repos.updateRelease({
        ...github.context.repo,
        release_id: release.id,
        draft
      })
    }
  } else {
    core.info('Creating release...')
    release = await github.repos.createRelease({
      ...github.context.repo,
      tag_name: tag,
      name: tag,
      body,
      draft,
      prerelease: version[4] != null
    })
  }
  core.info(`Release: ${release.data.html_url}`)
  core.setOutput("url", release.data.html_url)
  core.setOutput("tag", tag)
  core.setOutput("body", body)
} catch (error) {
  core.setFailed(error.message)
}