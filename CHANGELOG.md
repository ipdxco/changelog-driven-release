# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [1.0.14] - 2023-07-23

## [1.0.13] - 2023-11-15
### Fixed
- the checkout of changelog driven release repository in pr workflow

## [1.0.12] - 2023-11-15
### Fixed
- the reusable workflow context repository

## [1.0.11] - 2023-11-15
### Fixed
- set the name of the release to the tag name
- update target committish on update release call

## [1.0.10] - 2023-11-15
### Added
- reusable workflow which packages the PR Flow of the Changelog Driven Release

## [1.0.9] - 2023-11-14
### Changed
- moved to the IPDX namespace

## [1.0.8] - 2023-08-07
### Fixed
- target in draft releases

## [1.0.7] - 2023-03-27
### Fixed
- release retrieval after creation/update

## [1.0.6] - 2023-03-27
### Fixed
- fixed release retrieval after creation/update

## [1.0.5] - 2023-03-24
### Fixed
- changelog parsing when there is no released version in the CHANGELOG.md

## [1.0.4] - 2023-03-24
### Added
- tags output which contains all the created tags

## [1.0.3] - 2023-03-01
### Fixed
- subtags should be updated when the GitHub release is published

## [1.0.2] - 2023-02-28
### Fixed
- subtags should be updated when the parent tag is created
- tag should be created ahead of the GitHub release

## [1.0.1] - 2023-02-27
### Fixed
- creating subtags

## [1.0.0] - 2023-02-27
### Added
- v1 of the Changelog Drive Release action
