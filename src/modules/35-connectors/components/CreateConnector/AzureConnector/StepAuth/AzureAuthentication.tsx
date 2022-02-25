/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  FormikForm as Form,
  StepProps,
  Container,
  PageSpinner,
  ThumbnailSelect,
  FontVariation,
  FormInput,
  SelectOption
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import {
  DelegateTypes,
  DelegateCardInterface,
  setupAzureFormData
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'

import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { useStrings } from 'framework/strings'

interface AzureAuthenticationProps {
  name: string
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  onConnectorCreated?: (data?: ConnectorConfigDTO) => void | Promise<void>
  connectorInfo?: ConnectorInfoDTO | void
}

interface StepConfigureProps {
  closeModal?: () => void
  onSuccess?: () => void
}

interface AzureFormInterface {
  delegateType?: string
  environment: string | undefined
  clientId: string | undefined
  tenantId: string | undefined
  password: SecretReferenceInterface | void
}
const AzureAuthentication: React.FC<StepProps<StepConfigureProps> & AzureAuthenticationProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  const environments = {
    AZURE_GLOBAL: 'AZURE',
    US_GOVERNMENT: 'AZURE_US_GOVERNMENT'
  }

  const environmentOptions: SelectOption[] = [
    { label: 'Azure Global', value: environments.AZURE_GLOBAL },
    { label: 'US Government', value: environments.US_GOVERNMENT }
  ]

  const defaultInitialFormData: AzureFormInterface = {
    environment: environments.AZURE_GLOBAL,
    clientId: undefined,
    tenantId: undefined,
    password: undefined
  }

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)

  const DelegateCards: DelegateCardInterface[] = [
    {
      type: DelegateTypes.DELEGATE_OUT_CLUSTER,
      info: getString('connectors.GCP.delegateOutClusterInfo')
    },
    {
      type: DelegateTypes.DELEGATE_IN_CLUSTER,
      info: getString('connectors.GCP.delegateInClusterInfo')
    }
  ]

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupAzureFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as AzureFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepConfigureProps)
  }

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical height={'inherit'} spacing="medium">
      {/* className={css.secondStep}> */}
      <Text font={{ variation: FontVariation.H3 }} tooltipProps={{ dataTooltipId: 'azureAuthenticationDetails' }}>
        {getString('details')}
      </Text>
      <Formik
        initialValues={{
          ...initialValues,
          ...props.prevStepData
        }}
        formName="azureAuthForm"
        validationSchema={Yup.object().shape({
          delegateType: Yup.string().required(getString('connectors.chooseMethodForAzureConnection')),
          environment: Yup.string().required(getString('connectors.azure.validation.environment')),
          clientId: Yup.string().required(getString('connectors.azure.validation.clientId')),
          tenantId: Yup.string().required(getString('connectors.tenantIdRequired')),
          password: Yup.object().when('delegateType', {
            is: DelegateTypes.DELEGATE_OUT_CLUSTER,
            then: Yup.object().required(getString('validation.encryptedKey'))
          })
        })}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <Form>
            <Container>
              {/* className={css.clusterWrapper}> */}
              <ThumbnailSelect
                items={DelegateCards.map(card => ({ label: card.info, value: card.type }))}
                name="delegateType"
                size="large"
                onChange={type => {
                  formikProps?.setFieldValue('delegateType', type)
                }}
              />
              {DelegateTypes.DELEGATE_OUT_CLUSTER === formikProps.values.delegateType ? (
                <>
                  <FormInput.Select name="environment" label={getString('environment')} items={environmentOptions} />
                  <FormInput.Text
                    name={'clientId'}
                    placeholder={getString('connectors.azure.clientId')}
                    label={getString('connectors.azure.clientIdPlaceholder')}
                  />
                  <FormInput.Text
                    name={'tenantId'}
                    placeholder={getString('connectors.tenantId')}
                    label={getString('connectors.azure.tenantIdPlaceholder')}
                  />
                  <SecretInput name={'password'} label={getString('common.clientSecret')} />
                </>
              ) : null}
            </Container>
            <Button type="submit" intent="primary" text={getString('continue')} rightIcon="chevron-right" />
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default AzureAuthentication
