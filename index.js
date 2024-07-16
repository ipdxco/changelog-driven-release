const core = require('@actions/core')
const github = require('@actions/github')

const semverRegExp = /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/
const dateRegExp = /(0|\d{4})-(0|\d{2})-(0|\d{2})/
const headerRegExp = new RegExp(`^## \\[${semverRegExp.source}\\] - ${dateRegExp.source}$`)

async function run() {
  try {
    core.info('Creating release...')

    const path = core.getInput('path')
    const draft = core.getInput('draft') === 'true'
    const token = core.getInput('token')
    core.info(`Path: ${path}`)
    core.info(`Draft: ${draft}`)
    core.info(`Token: ${token != null ? '***' : null}`)

    const octokit = new github.getOctokit(token)

    core.info('Getting changelog...')
    let owner, repo, ref
    if (github.context.eventName == 'pull_request') {
      [owner, repo] = github.context.payload.pull_request.head.repo.full_name.split('/')
      ref = github.context.payload.pull_request.head.sha
    } else {
      owner = github.context.repo.owner
      repo = github.context.repo.repo
      ref = github.context.sha
    }
    core.info(`Owner: ${owner}`)
    core.info(`Repo: ${repo}`)
    core.info(`Ref: ${ref}`)
    const content = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref
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
    if (version == null) {
      core.info('No release found')
      return
    }

    const tag = `v${version[0]}`
    core.info(`Version: ${version[0]}`)
    core.info(`Body: ${body}`)
    core.info(`Tag: ${tag}`)

    core.info('Listing releases...')
    let releases = await octokit.paginate(octokit.rest.repos.listReleases, github.context.repo)
    let release = releases.find(release => release.tag_name === tag)

    if (release != null && release.published_at != null) {
      core.info('Release is already published')
      return
    }

    let target
    if (github.context.eventName == 'pull_request') {
      target = github.context.payload.pull_request.base.ref
    } else {
      target = github.context.sha
    }

    if (release == null) {
      core.info('Creating release...')
      const options = {
        ...github.context.repo,
        tag_name: tag,
        target_commitish: target,
        name: tag,
        body,
        draft,
        prerelease: version[4] != null
      }
      if (body.trim() !== '') {
        options.body = body
      } else {
        options.generate_release_notes = true
      }
      const response = (await octokit.rest.repos.createRelease(options)).data
      core.info(JSON.stringify(response, null, 2))
    } else {
      core.info('Updating release...')
      const response = await octokit.rest.repos.updateRelease({
        ...github.context.repo,
        release_id: release.id,
        target_commitish: target,
        draft
      })
      core.info(JSON.stringify(response, null, 2))
    }

    core.info('Waiting for 10 seconds...')
    await new Promise(resolve => setTimeout(resolve, 10000))

    core.info('Listing releases...')
    releases = await octokit.paginate(octokit.rest.repos.listReleases, github.context.repo)
    release = releases.find(release => release.tag_name === tag)

    if (release == null) {
      throw new Error('Release not found')
    }

    core.info(`Release: ${release.html_url}`)

    const tags = []
    if (release.published_at != null) {
      core.info('Updating mutable tags...')
      const suffix = `${version[4] != null ? '-' + version[4] : ''}${version[5] != null ? '+' + version[5] : ''}`
      tags.push(`v${version[1]}.${version[2]}${suffix}`)
      tags.push(`v${version[1]}${suffix}`)
      for (const tag of tags) {
        core.info(`Tag: ${tag}`)
        core.info('Listing refs...')
        const refs = await octokit.rest.git.listMatchingRefs({
          ...github.context.repo,
          ref: `tags/${tag}`
        })
        const ref = refs.data.find(ref => ref.ref === `refs/tags/${tag}`)
        if (ref == null) {
          core.info('Creating ref...')
          await octokit.rest.git.createRef({
            ...github.context.repo,
            ref: `refs/tags/${tag}`,
            sha: github.context.sha
          })
        } else {
          core.info('Updating ref...')
          await octokit.rest.git.updateRef({
            ...github.context.repo,
            ref: `tags/${tag}`,
            sha: github.context.sha,
            force: true
          })
        }
      }
    }
    tags.push(tag)

    core.setOutput("url", release.html_url)
    core.setOutput("tag", tag)
    core.setOutput("tags", tags.join(','))
    core.setOutput("body", body)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
