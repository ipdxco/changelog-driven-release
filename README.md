# Changelog Driven Release

Changelog Driven Release is a GitHub Action that automates the release process for GitHub Actions based on changes to a changelog file that follows [keep a changelog](https://keepachangelog.com/en/1.0.0/) guidelines. 

## Usage

To use the action, add the following step to your GitHub Actions workflow:

```yml
- name: Create GitHub release
  uses: pl-strflt/changelog-driven-release@v1
  with:
    path: 'CHANGELOG.md'
    draft: true
    token: ${{ secrets.GITHUB_TOKEN }}
```


### Inputs

* `path`: The path to the changelog file. Default: `CHANGELOG.md`.
* `draft`: Whether the release should be a draft or not. Default: `true`.
* `token`: The GitHub token used for creating a release. Default: The default token created for the workflow run.

### Outputs

* `url`: The URL of the created release.
* `tag`: The main tag of the release.
* `body`: The description the release was created with.

## How it works

The Changelog Driven Release action automates the release process for GitHub Actions based on changes to a changelog file that follows the keep a changelog guidelines.

When run, the action looks for the top-most release section in the changelog file and extracts the tag information from it. If the tag already exists, the action exits without creating a new release. If the tag does not exist, the action creates a new GitHub release with the extracted tag. The action creates three tags on publish: the main tag (`vX.Y.Z`), as well as two additional tags for the major (`vX`) and major-minor (`vX.Y`) version numbers.

The action supports both prerelease and build version suffixes. If the action is run in draft mode, the release will be a draft release. Otherwise, it will be a published release, with the tag automatically created.
## Example

This action is used to release itself. Here's an example release PR: https://github.com/pl-strflt/changelog-driven-release/pull/4. You can see the release workflow [here](https://github.com/pl-strflt/changelog-driven-release/blob/main/.github/workflows/release.yml) and the changelog that it uses [here](https://github.com/pl-strflt/changelog-driven-release/blob/main/CHANGELOG.md). 

---
