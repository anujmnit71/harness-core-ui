/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { BannerType } from '@common/layouts/Constants'
import { getBannerText } from '../UsageLimitUtils'

describe('Usage Limit Utils', () => {
  test('should return correct message under free plan and under limit', () => {
    const additionalLicenseProps = {
      isFreeEdition: true,
      isEnterpriseEdition: false,
      isTeamEdition: false
    }

    const limit = 25000
    const count = 24000

    const expectedMessage =
      'You have used 0.96% of Monthly Active Users (MAU) included in the free plan. After 25K MAUs, flag management will be restricted.'

    const getString = jest.fn().mockReturnValue(expectedMessage)
    const { message, bannerType } = getBannerText(getString, additionalLicenseProps, count, limit)

    expect(message).toEqual(expectedMessage)
    expect(bannerType).toEqual(BannerType.INFO)
  })
})
