import type {
  StageElementConfig,
  ApprovalStageConfig,
  DeploymentStageConfig,
  FeatureFlagStageConfig,
  StageElementWrapperConfig
} from 'services/cd-ng'
import type { IntegrationStageConfig, K8sDirectInfraYaml, UseFromStageInfraYaml, VmPoolYaml } from 'services/ci'

export type AllStageConfig =
  | ApprovalStageConfig
  | DeploymentStageConfig
  | FeatureFlagStageConfig
  | IntegrationStageConfig

export interface ApprovalStageElementConfig extends StageElementConfig {
  spec?: ApprovalStageConfig
}

export interface DeploymentStageElementConfig extends StageElementConfig {
  spec?: DeploymentStageConfig
}

export interface FeatureFlagStageElementConfig extends StageElementConfig {
  spec?: FeatureFlagStageConfig
  environment?: string
  featureType?: string
  featureFlag?: string
}

export interface BuildStageElementConfig extends StageElementConfig {
  spec?: IntegrationStageConfig & {
    infrastructure: K8sDirectInfraYaml | UseFromStageInfraYaml | VmPoolYaml
  }
}

export interface PipelineStageWrapper<T extends StageElementConfig = StageElementConfig> {
  stage?: StageElementWrapper<T>
  parent?: StageElementWrapperConfig
}

export interface StageElementWrapper<T extends StageElementConfig = StageElementConfig>
  extends StageElementWrapperConfig {
  stage?: T
}
