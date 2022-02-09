/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import * as Yup from 'yup'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { StringKeys } from 'framework/strings'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'

export const AllowedTypes = ['Git', 'Github', 'GitLab', 'Bitbucket']
export type ConnectorTypes = 'Git' | 'Github' | 'GitLab' | 'Bitbucket'

export const tfVarIcons: any = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket'
}

export const ConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET
}

export const ConnectorLabelMap: Record<ConnectorTypes, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'pipeline.manifestType.bitBucketLabel'
}

export const formInputNames = (isTerraformPlan: boolean) => ({
  repoName: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.repoName'
    : 'spec.configuration.spec.configFiles.store.spec.repoName',
  gitFetchType: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.gitFetchType'
    : 'spec.configuration.spec.configFiles.store.spec.gitFetchType',
  branch: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.branch'
    : 'spec.configuration.spec.configFiles.store.spec.branch',
  commitId: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.commitId'
    : 'spec.configuration.spec.configFiles.store.spec.commitId',
  folderPath: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.folderPath'
    : 'spec.configuration.spec.configFiles.store.spec.folderPath'
})

export const formikOnChangeNames = (isTerraformPlan: boolean) => ({
  repoName: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.repoName'
    : 'spec.configuration.spec.configFiles.store.spec.repoName',
  branch: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.branch'
    : 'spec.configuration.spec.configFiles.store.spec.branch',
  commitId: isTerraformPlan
    ? 'spec.configuration.configFiles.store.spec.commitId'
    : 'spec.configuration.spec.configFiles.spec.store.spec.commitId',
  folderPath: isTerraformPlan
    ? 'formik.values.spec.configuration.configFiles.store.spec.folderPath'
    : 'formik.values.spec.configuration.spec.store.spec.folderPath'
})

export const getBuildPayload = (type: ConnectorInfoDTO['type']) => {
  if (type === Connectors.GIT) {
    return buildGitPayload
  }
  if (type === Connectors.GITHUB) {
    return buildGithubPayload
  }
  if (type === Connectors.BITBUCKET) {
    return buildBitbucketPayload
  }
  if (type === Connectors.GITLAB) {
    return buildGitlabPayload
  }
  return () => ({})
}

export const stepTwoValidationSchema = (isTerraformPlan: boolean, getString: any) => {
  const configSetup = {
    configFiles: Yup.object().shape({
      store: Yup.object().shape({
        spec: Yup.object().shape({
          gitFetchType: Yup.string().required(getString('cd.gitFetchTypeRequired')),
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          folderPath: Yup.string().required(getString('pipeline.manifestType.folderPathRequired'))
        })
      })
    })
  }

  return isTerraformPlan
    ? Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            ...configSetup
          })
        })
      })
    : Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            spec: Yup.object().shape({
              ...configSetup
            })
          })
        })
      })
}
