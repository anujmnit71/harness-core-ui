/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ServiceDefinition, TemplateLinkConfig } from 'services/cd-ng'
import type { DeployEnvironmentEntityConfig } from '../DeployEnvironmentEntityStep/types'

export type DeployInfrastructureEntityStepProps = Required<DeployEnvironmentEntityConfig>['environment']

export interface DeployInfrastructureEntityCustomStepProps {
  deploymentType?: ServiceDefinition['type']
  environmentIdentifier?: string
  isMultipleInfrastructure?: boolean
}

export interface DeployInfrastructureEntityCustomInputStepProps extends DeployInfrastructureEntityCustomStepProps {
  deployToAllInfrastructures?: boolean
  customDeploymentRef?: TemplateLinkConfig
  showEnvironmentsSelectionInputField?: boolean
  areEnvironmentFiltersAdded?: boolean
  lazyInfrastructure?: boolean
}
