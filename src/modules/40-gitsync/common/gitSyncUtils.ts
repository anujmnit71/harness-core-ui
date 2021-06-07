import type { IconName } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import type { GitSyncConfig, ConnectorInfoDTO } from 'services/cd-ng'

export const getGitConnectorIcon = (type: GitSyncConfig['gitConnectorType']): IconName => {
  switch (type) {
    case Connectors.GITHUB:
      return 'github'
    case Connectors.GITLAB:
      return 'service-gotlab'
    case Connectors.BITBUCKET:
      return 'bitbucket-selected'
    default:
      return 'cog'
  }
}

export const modalTypes = {
  GIT_SYNC_REP: 'gitSyncRepo',
  GIT_SYNC_BRANCH: 'gitSyncBranch'
}

export interface ConnectorCardInterface {
  type: ConnectorInfoDTO['type']
  disabled?: boolean
  icon: {
    default: IconName
    selected: IconName
  }
}

export const gitCards: Array<ConnectorCardInterface> = [
  {
    type: Connectors.GITHUB,
    icon: {
      default: 'github-unselected',
      selected: 'github-selected'
    }
  }
  // {
  //   type: Connectors.GITLAB,
  //   disabled: true,
  //   icon: {
  //     default: 'gitlab-unselected',
  //     selected: 'gitlab-selected'
  //   }
  // },
  // {
  //   type: Connectors.BITBUCKET,
  //   disabled: true,
  //   icon: {
  //     default: 'bitbucket-unselected',
  //     selected: 'bitbucket-selected'
  //   }
  // }
]

export const getRepoPath = (gitRepo: GitSyncConfig): string => {
  let basePath = ''
  switch (gitRepo.gitConnectorType) {
    case Connectors.GITHUB:
      basePath = 'https://github.com/'
      break
    case Connectors.GITLAB:
      basePath = 'https://gitlab.com/'
      break
    case Connectors.BITBUCKET:
      basePath = 'https://bitbucket.com/'
  }

  return gitRepo.repo?.split(basePath)[1] || ''
}

export const getCompleteGitPath = (repo: string, rootFolder: string, suffix: string): string =>
  repo.concat('/').concat(rootFolder).concat(suffix)

export const getExternalUrl = (repo?: string, branch?: string, folderPath?: string): string => {
  console.log(repo, branch, folderPath)
  if (repo && branch && folderPath) {
    return repo.concat('/').concat('tree').concat('/').concat(branch).concat('/').concat(folderPath)
  }
  return ''
}
