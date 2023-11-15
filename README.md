# Changelog Driven Release

Changelog Driven Release is a GitHub Actions reusable workflow that automates the release process based on changes to a changelog file that follows [keep a changelog](https://keepachangelog.com/en/1.0.0/) guidelines.

## Usage

To use the reusable workflow, add the following file to your GitHub Actions workflow directory:

```yml
name: Release

on:
  push:
    paths: [CHANGELOG.md]
    branches: [main]
  pull_request:
    paths: [CHANGELOG.md]
    branches: [main]

permissions:
  contents: write

jobs:
  publish:
    uses: ipdxco/changelog-driven-release/.github/workflows/pr.yml@v1
```

See [the full example](./.github/workflows/release.yml) of how we use Changelog Driven Release to release Changelog Driven Release 🔁

### Inputs

* `path`: The path to the changelog file. Default: `CHANGELOG.md`.

### Outputs

* `url`: The URL of the created release.
* `tag`: The main tag of the release.
* `tags`: The tags of the release.
* `body`: The description the release was created with.
* `previous_comment_id`: The ID of the comment that was created on the previous release.
* `created_comment_id`: The ID of the comment that was created on the current release.

## How it works

The Changelog Driven Release reusable workflow automates the release process based on changes to a changelog file that follows the keep a changelog guidelines.

When run, the worfklow looks for the top-most release section in the changelog file and extracts the tag information from it. If the tag already exists, it exits without creating a new release. If the tag does not exist, it creates a new GitHub release with the extracted tag (draft if the run happens in the context of a PR). It creates three tags on publish (merge): the main tag (`vX.Y.Z`), as well as two additional tags for the major (`vX`) and major-minor (`vX.Y`) version numbers.

Finally, if the run happens in the context of a PR, it creates a comment with the changelog section's contents.

It supports both prerelease and build version suffixes.

---
