/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { BannerType } from '@common/layouts/Constants'
import type { CheckFeatureReturn } from 'framework/featureStore/featureStoreUtil'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import * as UsageLimitUtils from '../UsageLimitUtils'

const getString = jest.fn()

describe('Usage Limit Utils', () => {
  const { getBannerText } = UsageLimitUtils
  test('should return correct message under free plan and under limit', () => {
    const feature = new Map<FeatureIdentifier, CheckFeatureReturn>()
    feature.set(FeatureIdentifier.MAUS, {
      enabled: true,
      featureDetail: {
        featureName: FeatureIdentifier.MAUS,
        enabled: true,
        moduleType: 'CF',
        limit: 25000,
        count: 200,
        apiFail: false
      }
    })

    const additionalLicenseProps = {
      isFreeEdition: true,
      isEnterpriseEdition: false,
      isTeamEdition: false
    }

    const monthlyActiveUsers = feature.get(FeatureIdentifier.MAUS)

    const message =
      'You have used 0.8% of Monthly Active Users (MAU) included in the free plan. After 25K MAUs, flag management will be restricted.'

    expect(getBannerText(getString, monthlyActiveUsers, additionalLicenseProps)).toStrictEqual({
      message: () => message,
      bannerType: BannerType.INFO
    })
  })
})
