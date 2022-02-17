/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import type { FormikValues } from 'formik'
import { cloneDeep, defaultTo, get, isEmpty, merge, unset } from 'lodash-es'
import type { GetDataError } from 'restful-react'
import { parse } from 'yaml'
import {
  PRIMARY_ARTIFACT,
  TriggerDefaultFieldList,
  TriggerTypes
} from '@pipeline/pages/triggers/utils/TriggersWizardPageUtils'
import type { K8SDirectServiceStep } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import type {
  ArtifactoryBuildDetailsDTO,
  DockerBuildDetailsDTO,
  EcrBuildDetailsDTO,
  GcrBuildDetailsDTO,
  NexusBuildDetailsDTO,
  PipelineInfoConfig
} from 'services/cd-ng'
import { RegistryHostNames } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { clearRuntimeInputValue } from '../K8sServiceSpecHelper'

export type BuildDetailsDTO =
  | DockerBuildDetailsDTO[]
  | GcrBuildDetailsDTO[]
  | EcrBuildDetailsDTO[]
  | NexusBuildDetailsDTO[]
  | ArtifactoryBuildDetailsDTO[]

export const resetTags = (formik: FormikValues, tagPath: string): void => {
  const tagValue = get(formik.values, tagPath, '')
  if (getMultiTypeFromValue(tagValue) === MultiTypeInputType.FIXED && tagValue?.length) {
    formik.setFieldValue(tagPath, '')
  }
}

export const fromPipelineInputTriggerTab = (formik: FormikValues, fromTrigger = false): boolean => {
  return (
    formik?.values?.triggerType === TriggerTypes.ARTIFACT && formik?.values?.selectedArtifact !== null && !fromTrigger
  )
}

export const isSelectedStage = (stageIdentifier: string, formikStageId: string): boolean =>
  stageIdentifier === formikStageId
export const isSelectedPrimaryArtifact = (selectedArtifact: any): boolean =>
  !isEmpty(selectedArtifact) && (!selectedArtifact.identifier || selectedArtifact.identifier === PRIMARY_ARTIFACT)

export const isFieldfromTriggerTabDisabled = (
  fieldName: string,
  formik: FormikValues,
  stageIdentifier: string,
  fromTrigger = false
): boolean => {
  if (fromTrigger) {
    // Trigger Configuration Tab
    return get(TriggerDefaultFieldList, fieldName) ? true : false
  } else if (
    fromPipelineInputTriggerTab(formik, fromTrigger) &&
    isSelectedPrimaryArtifact(formik?.values?.selectedArtifact) &&
    isSelectedStage(stageIdentifier, formik?.values?.stageId)
  ) {
    return true
  }
  return false
}

export const getTagError = (fetchTagsError: GetDataError<any> | null): string =>
  get(fetchTagsError, 'data.message', null)

export const getYamlData = (formikValues: Record<string, any>): PipelineInfoConfig =>
  clearRuntimeInputValue(
    cloneDeep(
      parse(
        defaultTo(
          JSON.stringify({
            pipeline: formikValues
          }),
          ''
        )
      )
    )
  )

export const setPrimaryInitialValues = (
  initialValues: K8SDirectServiceStep,
  formik: FormikValues,
  stageIdentifier: string
): void => {
  if (stageIdentifier === formik?.values?.stageId) {
    if (initialValues?.artifacts?.primary) {
      const { selectedArtifact } = formik?.values
      /*
         backend requires eventConditions inside selectedArtifact but should not be added to inputYaml
        */
      if (selectedArtifact?.spec.eventConditions) {
        unset(selectedArtifact?.spec, 'eventConditions')
      }

      merge(initialValues?.artifacts?.primary, {
        identifier: selectedArtifact?.identifier,
        type: selectedArtifact?.type,
        spec: {
          ...selectedArtifact?.spec
        }
      })
    }
  }
}

export const gcrUrlList: SelectOption[] = Object.values(RegistryHostNames).map(item => ({ label: item, value: item }))
