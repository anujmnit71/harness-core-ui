/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import {
  Button,
  Card,
  Container,
  Icon,
  Layout,
  Text,
  FontVariation,
  ButtonVariation,
  useToaster
} from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { Module, ModuleName } from 'framework/types/ModuleName'
import { getModuleLink } from '@projects-orgs/components/ModuleListCard/ModuleListCard'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getModuleDescriptionsForModuleSelectionDialog, getModuleFullLengthTitle } from '@projects-orgs/utils/utils'
import { getModuleIcon } from '@common/utils/utils'
import {
  Project,
  StartFreeLicenseQueryParams,
  useStartTrialLicense,
  useStartFreeLicense,
  StartTrialDTO
} from 'services/cd-ng'
import ModuleSelectionFactory from '@projects-orgs/factories/ModuleSelectionFactory'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { Editions, ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import routes from '@common/RouteDefinitions'
import css from './useModuleSelect.module.scss'

export interface UseModuleSelectModalProps {
  onSuccess?: () => void
  onCloseModal?: () => void
}
export type RenderElementOnModuleSelection = { [K in ModuleName]?: JSX.Element }
export interface UseModuleSelectModalReturn {
  openModuleSelectModal: (projectData: Project) => void
  closeModuleSelectModal: () => void
}
interface InfoCards {
  name: ModuleName
}
const modulesWithSubscriptions = [ModuleName.CD, ModuleName.CE, ModuleName.CF, ModuleName.CI]
export const useModuleSelectModal = ({
  onSuccess,
  onCloseModal
}: UseModuleSelectModalProps): UseModuleSelectModalReturn => {
  const { getString } = useStrings()

  const history = useHistory()
  const [selectedModuleName, setSelectedModuleName] = React.useState<ModuleName>()
  const [projectData, setProjectData] = React.useState<Project>()
  const { accountId } = useParams<AccountPathProps>()
  const { FREE_PLAN_ENABLED } = useFeatureFlags()
  const { showError } = useToaster()

  const { mutate: startTrial } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: startFreePlan } = useStartFreeLicense({
    queryParams: {
      accountIdentifier: accountId,
      moduleType: ModuleName.CD
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()
  const modalProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 1100,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'auto'
    }
  }
  const infoCards: InfoCards[] = []

  if (CDNG_ENABLED) {
    infoCards.push({
      name: ModuleName.CD
    })
  }
  if (CING_ENABLED) {
    infoCards.push({
      name: ModuleName.CI
    })
  }
  if (CFNG_ENABLED) {
    infoCards.push({
      name: ModuleName.CF
    })
  }
  if (CENG_ENABLED) {
    infoCards.push({
      name: ModuleName.CE
    })
  }
  if (CVNG_ENABLED) {
    infoCards.push({
      name: ModuleName.CV
    })
  }
  const gotoModule = (search: string) => {
    if (selectedModuleName) {
      switch (selectedModuleName) {
        case ModuleName.CE: {
          history.push({
            pathname: routes.toModuleTrialHome({
              accountId,
              module: selectedModuleName.toLocaleLowerCase() as Module
            }),
            search: search
          })
          break
        }
        case ModuleName.CF: {
          if (projectData) {
            history.push({
              pathname: routes.toCFOnboarding({
                orgIdentifier: projectData?.orgIdentifier || '',
                projectIdentifier: projectData.identifier,
                accountId
              })
            })
          }
          break
        }
        case ModuleName.CD:
        case ModuleName.CI: {
          if (projectData) {
            const pathname = routes.toPipelineStudio({
              orgIdentifier: projectData.orgIdentifier || '',
              projectIdentifier: projectData.identifier,
              pipelineIdentifier: '-1',
              accountId,
              module: selectedModuleName.toLowerCase() as Module
            })
            history.push({
              pathname,
              search: `modal=${FREE_PLAN_ENABLED ? ModuleLicenseType.FREE : ModuleLicenseType.TRIAL}`
            })
          }
          break
        }
        default: {
          history.push({
            pathname: routes.toModuleHome({
              accountId,
              module: selectedModuleName.toLocaleLowerCase() as Module
            }),

            search
          })
        }
      }
    }
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        onClose={() => {
          onSuccess?.()
          onCloseModal?.()
          hideModal()
        }}
        {...modalProps}
        title={
          <Container padding={{ left: 'xxlarge', top: 'xxlarge' }}>
            <Text font={{ variation: FontVariation.H3 }}>{getString('projectsOrgs.moduleSelectionTitle')}</Text>
          </Container>
        }
      >
        <Layout.Horizontal padding="huge">
          <Layout.Horizontal className={css.cardsContainer}>
            {infoCards.map(module => {
              const desc = getModuleDescriptionsForModuleSelectionDialog(module.name)
              return (
                <Card
                  className={css.card}
                  key={module.name}
                  interactive
                  selected={module.name === selectedModuleName}
                  onClick={() => {
                    setSelectedModuleName(module.name)
                  }}
                >
                  <Layout.Vertical spacing="small">
                    <Layout.Horizontal flex spacing="small">
                      <Icon name={getModuleIcon(module.name)} size={35}></Icon>
                      <Text font={{ variation: FontVariation.H6 }}>
                        {getString(getModuleFullLengthTitle(module.name))}
                      </Text>
                    </Layout.Horizontal>
                    <Text font={{ variation: FontVariation.SMALL }}>{desc && getString(desc)}</Text>
                  </Layout.Vertical>
                </Card>
              )
            })}
          </Layout.Horizontal>
          <Container className={css.moduleActionDiv} padding={{ left: 'huge' }}>
            {selectedModuleName
              ? ModuleSelectionFactory.getModuleSelectionEle(selectedModuleName) || (
                  <Layout.Vertical spacing="medium">
                    <Text font={{ variation: FontVariation.H4 }}>
                      {getString(getModuleFullLengthTitle(selectedModuleName))}
                    </Text>
                    <Button
                      text={
                        !licenseInformation[selectedModuleName] && modulesWithSubscriptions.includes(selectedModuleName)
                          ? FREE_PLAN_ENABLED
                            ? getString('common.startFreePlan', {
                                module: selectedModuleName
                              })
                            : getString('common.startTrial', {
                                module: selectedModuleName
                              })
                          : getString('projectsOrgs.goToModuleBtn')
                      }
                      width={
                        !licenseInformation[selectedModuleName] && modulesWithSubscriptions.includes(selectedModuleName)
                          ? undefined
                          : 150
                      }
                      variation={ButtonVariation.PRIMARY}
                      onClick={() => {
                        if (
                          projectData &&
                          projectData.orgIdentifier &&
                          (licenseInformation[selectedModuleName] ||
                            !modulesWithSubscriptions.includes(selectedModuleName))
                        ) {
                          history.push(
                            getModuleLink({
                              module: selectedModuleName,
                              orgIdentifier: projectData?.orgIdentifier,
                              projectIdentifier: projectData.identifier,
                              accountId
                            })
                          )
                        } else {
                          if (FREE_PLAN_ENABLED) {
                            startFreePlan(undefined, {
                              queryParams: {
                                accountIdentifier: accountId,
                                moduleType: selectedModuleName as StartFreeLicenseQueryParams['moduleType']
                              }
                            })
                              .then(planData => {
                                handleUpdateLicenseStore(
                                  { ...licenseInformation },
                                  updateLicenseStore,
                                  selectedModuleName.toLowerCase() as Module,
                                  planData?.data
                                )
                                gotoModule(`?experience=${ModuleLicenseType.FREE}&&modal=${ModuleLicenseType.FREE}`)
                              })
                              .catch(err => {
                                showError(err)
                              })
                          } else {
                            startTrial({
                              moduleType: selectedModuleName as StartTrialDTO['moduleType'],
                              edition: Editions.ENTERPRISE
                            })
                              .then(planData => {
                                handleUpdateLicenseStore(
                                  { ...licenseInformation },
                                  updateLicenseStore,
                                  selectedModuleName.toLowerCase() as Module,
                                  planData?.data
                                )
                                gotoModule(`?experience=${ModuleLicenseType.TRIAL}&&modal=${ModuleLicenseType.TRIAL}`)
                              })
                              .catch(err => {
                                showError(err)
                              })
                          }
                        }
                      }}
                    ></Button>
                  </Layout.Vertical>
                )
              : null}
          </Container>
        </Layout.Horizontal>
      </Dialog>
    ),
    [selectedModuleName]
  )

  const open = useCallback(
    (projectDataLocal: Project) => {
      setProjectData(projectDataLocal)
      showModal()
    },
    [showModal]
  )

  return {
    openModuleSelectModal: (projectDataLocal: Project) => open(projectDataLocal),
    closeModuleSelectModal: hideModal
  }
}
