import React, { useCallback, useContext, useMemo } from 'react'
import {
  Color,
  Container,
  Card,
  Formik,
  FormikForm,
  FormInput,
  Text,
  IconName,
  Layout,
  Icon
} from '@wings-software/uicore'
import { useParams } from 'react-router'
import cx from 'classnames'
import { SelectOrCreateConnectorFieldNames } from '@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { BGColorWrapper } from '@cv/pages/health-source/common/StyledComponents'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { Connectors } from '@connectors/constants'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import { HEALTHSOURCE_LIST } from './DefineHealthSource.constant'
import { validate, getFeatureOption, getInitialValues } from './DefineHealthSource.utils'
import css from './DefineHealthSource.module.scss'

interface DefineHealthSourceProps {
  onSubmit?: (values: any) => void
}

function DefineHealthSource(props: DefineHealthSourceProps): JSX.Element {
  const { onSubmit } = props
  const { getString } = useStrings()
  const { onNext, sourceData } = useContext(SetupSourceTabsContext)

  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const { isEdit } = sourceData

  const initialValues = useMemo(() => {
    return getInitialValues(sourceData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceData?.healthSourceIdentifier])

  const isCardSelected = useCallback((name, formik) => {
    if (formik?.values?.product?.value) {
      const features = getFeatureOption(name, getString)
      return features.some(el => el?.value === formik.values.product.value)
    } else {
      return name == formik?.values?.sourceType
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BGColorWrapper>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        formName={'defineHealthsource'}
        validationSchema={validate(getString)}
        onSubmit={values => {
          onSubmit?.(values)
          onNext(values, { tabStatus: 'SUCCESS' })
        }}
      >
        {formik => {
          return (
            <FormikForm className={css.formFullheight}>
              <CardWithOuterTitle title={getString('cv.healthSource.defineHealthSource')}>
                <>
                  <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'large' }}>
                    {getString('cv.healthSource.selectHealthSource')}
                  </Text>
                  <FormInput.CustomRender
                    name={'sourceType'}
                    render={() => {
                      return (
                        <Layout.Horizontal
                          className={cx(isEdit && css.disabled)}
                          height={120}
                          margin={{ left: 'xxxlarge', right: 'xxxlarge' }}
                        >
                          {HEALTHSOURCE_LIST.map(({ name, icon }) => {
                            const connectorTypeName =
                              name === HealthSourceTypes.GoogleCloudOperations ? Connectors.GCP : name
                            return (
                              <div key={name} className={cx(css.squareCardContainer, isEdit && css.disabled)}>
                                <Card
                                  disabled={false}
                                  interactive={true}
                                  selected={isCardSelected(connectorTypeName, formik)}
                                  cornerSelected={isCardSelected(connectorTypeName, formik)}
                                  className={css.squareCard}
                                  onClick={() => {
                                    formik.setFieldValue('sourceType', connectorTypeName)
                                    formik.setFieldValue('product', '')
                                    formik.setFieldValue(SelectOrCreateConnectorFieldNames.CONNECTOR_REF, null)
                                  }}
                                >
                                  <Icon name={icon as IconName} size={26} height={26} />
                                </Card>
                                <Text
                                  className={css.healthSourceName}
                                  style={{
                                    color: name === formik.values.sourceType ? 'var(--grey-900)' : 'var(--grey-350)'
                                  }}
                                >
                                  {name}
                                </Text>
                              </div>
                            )
                          })}
                        </Layout.Horizontal>
                      )
                    }}
                  />
                  <Container margin={{ bottom: 'large' }} width={'400px'} color={Color.BLACK}>
                    <FormInput.InputWithIdentifier
                      isIdentifierEditable={!isEdit}
                      inputName="healthSourceName"
                      inputLabel={getString('cv.healthSource.nameLabel')}
                      inputGroupProps={{
                        placeholder: getString('cv.healthSource.namePlaceholder')
                      }}
                      idName="healthSourceIdentifier"
                    />
                  </Container>
                  <Text font={'small'} color={Color.BLACK}>
                    {getString('cv.healthSource.seriveEnvironmentNote', {
                      service: formik?.values?.serviceRef,
                      environment: formik?.values?.environmentRef
                    })}
                  </Text>
                </>
              </CardWithOuterTitle>
              <CardWithOuterTitle title={getString('cv.healthSource.connectHealthSource')}>
                <>
                  <Container margin={{ bottom: 'large' }} width={'400px'}>
                    <div className={css.connectorField}>
                      <FormConnectorReferenceField
                        width={400}
                        formik={formik}
                        type={formik?.values?.sourceType}
                        name={SelectOrCreateConnectorFieldNames.CONNECTOR_REF}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        placeholder={getString('cv.healthSource.connectors.selectConnector', {
                          sourceType: formik?.values?.sourceType
                        })}
                        disabled={isEdit ? !!formik?.values?.connectorRef && isEdit : !formik?.values?.sourceType}
                        label={
                          <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
                            {getString('connectors.selectConnector')}
                          </Text>
                        }
                      />
                    </div>
                  </Container>
                  <Container margin={{ bottom: 'large' }} width={'400px'}>
                    <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
                      {getString('cv.healthSource.featureLabel')}
                    </Text>
                    <FormInput.Select
                      items={getFeatureOption(formik?.values?.sourceType, getString)}
                      placeholder={getString('cv.healthSource.featurePlaceholder', {
                        sourceType: formik?.values?.sourceType
                      })}
                      value={formik?.values?.product}
                      name="product"
                      disabled={isEdit}
                      onChange={product => formik.setFieldValue('product', product)}
                    />
                  </Container>
                </>
              </CardWithOuterTitle>
              <DrawerFooter onNext={() => formik.submitForm()} />
            </FormikForm>
          )
        }}
      </Formik>
    </BGColorWrapper>
  )
}

export default DefineHealthSource
