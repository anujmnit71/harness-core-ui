/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import { useToaster } from '@harness/uicore'
import { get } from 'lodash-es'
import patch from '@cf/utils/instructions'
import { FeatureState, PatchFeatureQueryParams, usePatchFeature } from 'services/cf'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import type { TargetingRulesFormValues } from '../TargetingRulesTab'

interface UsePatchFeatureFlagProps {
  featureFlagIdentifier: string
  initialValues: TargetingRulesFormValues
  refetchFlag: () => Promise<unknown>
}

interface UsePatchFeatureFlagReturn {
  saveChanges: (values: TargetingRulesFormValues) => void
}

const usePatchFeatureFlag = ({
  featureFlagIdentifier,
  initialValues,
  refetchFlag
}: UsePatchFeatureFlagProps): UsePatchFeatureFlagReturn => {
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const { showError } = useToaster()

  const { mutate: patchFeature } = usePatchFeature({
    identifier: featureFlagIdentifier as string,
    queryParams: {
      projectIdentifier,
      environmentIdentifier,
      accountIdentifier,
      orgIdentifier
    } as PatchFeatureQueryParams
  })

  const saveChanges = (values: TargetingRulesFormValues): void => {
    if (values.state !== initialValues.state) {
      patch.feature.addInstruction(patch.creators.setFeatureFlagState(values?.state as FeatureState))
    }

    try {
      patch.feature.onPatchAvailable(async data => {
        await patchFeature(data)
        refetchFlag()
      })

      patch.feature.reset()
    } catch (error: any) {
      showError(get(error, 'data.message', error?.message), 0)
    }
  }

  return {
    saveChanges
  }
}

export default usePatchFeatureFlag
