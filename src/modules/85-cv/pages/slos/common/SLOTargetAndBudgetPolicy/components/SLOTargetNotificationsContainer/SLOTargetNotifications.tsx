/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect } from 'react'
import type { GetDataError } from 'restful-react'
import NotificationsContainer from '@cv/components/Notifications/NotificationsContainer'
import { SRMNotificationType } from '@cv/components/Notifications/NotificationsContainer.types'
import { SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import {
  getUpdatedNotifications,
  getUpdatedNotificationsRuleRefs,
  toggleNotification
} from '@cv/components/Notifications/NotificationsContainer.utils'
import type { RestResponseNotificationRuleResponse, NotificationRuleResponse } from 'services/cv'
import ConfigureSLOAlertConditions from '@cv/components/Notifications/components/ConfigureSLOAlertConditions/ConfigureSLOAlertConditions'
import { useStrings } from 'framework/strings'
import type { NotificationToToggle } from '../../SLOTargetAndBudgetPolicy.types'

interface SLOTargetNotificationsProps {
  setFieldValue: (field: string, value: any) => void
  setPage: (index: number) => void
  initialNotificationsTableData: NotificationRuleResponse[]
  loading: boolean
  error: GetDataError<unknown> | null
  page: number
  getNotifications: () => Promise<void>
  notificationsInTable: NotificationRuleResponse[]
  setNotificationsInTable: React.Dispatch<React.SetStateAction<NotificationRuleResponse[]>>
}

export default function SLOTargetNotifications(props: SLOTargetNotificationsProps): JSX.Element {
  const {
    setFieldValue,
    initialNotificationsTableData,
    setPage,
    loading,
    error,
    page,
    getNotifications,
    notificationsInTable,
    setNotificationsInTable
  } = props

  const { getString } = useStrings()

  useEffect(() => {
    if (!notificationsInTable.length && initialNotificationsTableData.length) {
      setNotificationsInTable(initialNotificationsTableData)
    }
  }, [initialNotificationsTableData])

  const handleCreateNotification = useCallback(
    (latestNotification: RestResponseNotificationRuleResponse) => {
      const updatedNotificationsInTable = getUpdatedNotifications(
        latestNotification,
        notificationsInTable as NotificationRuleResponse[]
      )
      const updatedNotificationRuleRefs = getUpdatedNotificationsRuleRefs(updatedNotificationsInTable)
      setNotificationsInTable(updatedNotificationsInTable)
      setFieldValue(SLOV2FormFields.NOTIFICATION_RULE_REFS, updatedNotificationRuleRefs)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notificationsInTable]
  )

  const handleDeleteNotification = useCallback((updatedNotifications: NotificationRuleResponse[]) => {
    const updatedNotificationRuleRefs = getUpdatedNotificationsRuleRefs(updatedNotifications)
    setNotificationsInTable(updatedNotifications)
    setFieldValue(SLOV2FormFields.NOTIFICATION_RULE_REFS, updatedNotificationRuleRefs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggleNotification = useCallback(
    (notificationToToggle: NotificationToToggle) => {
      const updatedNotificationsInTable = toggleNotification(
        notificationToToggle,
        notificationsInTable as NotificationRuleResponse[]
      )
      const updatedNotificationRuleRefs = getUpdatedNotificationsRuleRefs(updatedNotificationsInTable)
      setNotificationsInTable(updatedNotificationsInTable)
      setFieldValue(SLOV2FormFields.NOTIFICATION_RULE_REFS, updatedNotificationRuleRefs)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notificationsInTable]
  )

  return (
    <NotificationsContainer
      type={SRMNotificationType.SERVICE_LEVEL_OBJECTIVE}
      handleDeleteNotification={handleDeleteNotification}
      handleCreateNotification={handleCreateNotification}
      handleToggleNotification={handleToggleNotification}
      notificationsInTable={notificationsInTable as NotificationRuleResponse[]}
      setPage={setPage}
      page={page}
      loading={loading}
      error={error}
      getNotifications={getNotifications}
    >
      <ConfigureSLOAlertConditions name={getString('conditions')} />
    </NotificationsContainer>
  )
}
