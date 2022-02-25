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
import { showToaster } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import type { TargetingRulesFormValues } from '../TargetingRulesTab'

interface UsePatchFeatureFlagProps {
  featureFlagIdentifier: string
  initialValues: TargetingRulesFormValues
}

interface UsePatchFeatureFlagReturn {
  saveChanges: (values: TargetingRulesFormValues, onSuccess: () => void) => void
  loading: boolean
}

const usePatchFeatureFlag = ({
  featureFlagIdentifier,
  initialValues
}: UsePatchFeatureFlagProps): UsePatchFeatureFlagReturn => {
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const { showError } = useToaster()
  const { getString } = useStrings()

  const { mutate: patchFeature, loading } = usePatchFeature({
    identifier: featureFlagIdentifier as string,
    queryParams: {
      projectIdentifier,
      environmentIdentifier,
      accountIdentifier,
      orgIdentifier
    } as PatchFeatureQueryParams
  })

  const saveChanges = (values: TargetingRulesFormValues, onSuccess: () => void): void => {
    if (values.state !== initialValues.state) {
      patch.feature.addInstruction(patch.creators.setFeatureFlagState(values?.state as FeatureState))
    }

    try {
      patch.feature.onPatchAvailable(async data => {
        await patchFeature(data)

        showToaster(getString('cf.messages.flagUpdated'))

        onSuccess()
      })

      patch.feature.reset()
    } catch (error: any) {
      showError(get(error, 'data.message', error?.message), 0)
    }
  }
  return {
    saveChanges,
    loading
  }
}

export default usePatchFeatureFlag
