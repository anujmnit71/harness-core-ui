/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  AllowedTypes,
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  StepProps,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import { defaultTo, get, set } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import MultiConfigSelectField from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { FileUsage } from '@filestore/interfaces/FileStore'
import {
  getSkipResourceVersioningBasedOnDeclarativeRollback,
  ManifestDataType,
  ManifestIdentifierValidation,
  ManifestStoreMap
} from '../../Manifesthelper'
import type {
  HarnessFileStoreDataType,
  HarnessFileStoreFormData,
  HarnessFileStoreManifestLastStepPrevStepData,
  ManifestTypes
} from '../../ManifestInterface'
import { ManifestDetailsAdvancedSection } from '../CommonManifestDetails/ManifestDetailsAdvancedSection'
import { shouldAllowOnlyOneFilePath } from '../CommonManifestDetails/utils'
import { removeEmptyFieldsFromStringArray } from '../ManifestUtils'
import css from '../CommonManifestDetails/CommonManifestDetails.module.scss'

interface HarnessFileStorePropType {
  stepName: string
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  expressions: string[]
  selectedManifest: ManifestTypes | null
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
  showIdentifierField?: boolean
  editManifestModePrevStepData?: HarnessFileStoreManifestLastStepPrevStepData
}

const showValuesPaths = (selectedManifest: ManifestTypes): boolean => {
  return [ManifestDataType.K8sManifest, ManifestDataType.HelmChart].includes(selectedManifest)
}
const showParamsPaths = (selectedManifest: ManifestTypes): boolean => {
  return selectedManifest === ManifestDataType.OpenshiftTemplate
}
const showSkipResourceVersion = (selectedManifest: ManifestTypes): boolean => {
  return [ManifestDataType.K8sManifest, ManifestDataType.HelmChart, ManifestDataType.OpenshiftTemplate].includes(
    selectedManifest
  )
}
function HarnessFileStore({
  stepName,
  selectedManifest,
  allowableTypes,
  expressions,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  isReadonly,
  showIdentifierField = true,
  editManifestModePrevStepData
}: StepProps<ConnectorConfigDTO> & HarnessFileStorePropType): React.ReactElement {
  const { getString } = useStrings()
  const isOnlyFileTypeManifest = selectedManifest && [ManifestDataType.Values].includes(selectedManifest)

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)

  const getInitialValues = (): HarnessFileStoreDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)
    const valuesPaths = get(initialValues, 'spec.valuesPaths')
    const paramsPaths = get(initialValues, 'spec.paramsPaths')
    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        valuesPaths:
          typeof valuesPaths === 'string' ? valuesPaths : removeEmptyFieldsFromStringArray(valuesPaths, true),
        paramsPaths: typeof paramsPaths === 'string' ? paramsPaths : removeEmptyFieldsFromStringArray(paramsPaths),
        skipResourceVersioning: get(initialValues, 'spec.skipResourceVersioning'),
        enableDeclarativeRollback: get(initialValues, 'spec.enableDeclarativeRollback')
      }
    }
    return {
      identifier: '',
      files: [''],
      valuesPaths: [''],
      paramsPaths: [],
      skipResourceVersioning: false,
      enableDeclarativeRollback: false
    }
  }

  const submitFormData = (formData: HarnessFileStoreFormData & { store?: string }): void => {
    /* istanbul ignore else */
    if (formData) {
      const manifestObj: ManifestConfigWrapper = {
        manifest: {
          identifier: formData.identifier,
          type: selectedManifest as ManifestTypes,
          spec: {
            store: {
              type: ManifestStoreMap.Harness,
              spec: {
                files: formData.files
              }
            }
          }
        }
      }
      if (showValuesPaths(selectedManifest as ManifestTypes)) {
        set(
          manifestObj,
          'manifest.spec.valuesPaths',
          typeof formData?.valuesPaths === 'string'
            ? formData?.valuesPaths
            : removeEmptyFieldsFromStringArray(formData.valuesPaths)
        )
      }
      if (showParamsPaths(selectedManifest as ManifestTypes)) {
        set(
          manifestObj,
          'manifest.spec.paramsPaths',
          typeof formData?.paramsPaths === 'string'
            ? formData?.paramsPaths
            : removeEmptyFieldsFromStringArray(formData.paramsPaths)
        )
      }
      if (showSkipResourceVersion(selectedManifest as ManifestTypes)) {
        set(
          manifestObj,
          'manifest.spec.skipResourceVersioning',
          getSkipResourceVersioningBasedOnDeclarativeRollback(
            formData?.skipResourceVersioning,
            formData?.enableDeclarativeRollback
          )
        )
        set(manifestObj, 'manifest.spec.enableDeclarativeRollback', formData?.enableDeclarativeRollback)
      }

      handleSubmit(manifestObj)
    }
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="harnessFileStore"
        validationSchema={Yup.object().shape({
          ...(showIdentifierField
            ? ManifestIdentifierValidation(
                getString,
                manifestIdsList,
                initialValues?.identifier,
                getString('pipeline.uniqueName')
              )
            : {}),
          files: Yup.lazy((value): Yup.Schema<unknown> => {
            if (getMultiTypeFromValue(value as string[]) === MultiTypeInputType.FIXED) {
              return Yup.array().of(Yup.string().required(getString('pipeline.manifestType.pathRequired')))
            }
            return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
          })
        })}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData
          } as unknown as HarnessFileStoreFormData)
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.manifestForm}
              >
                <div className={css.manifestStepWidth}>
                  {showIdentifierField && (
                    <div className={css.halfWidth}>
                      <FormInput.Text
                        name="identifier"
                        label={getString('pipeline.manifestType.manifestIdentifier')}
                        placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                        isIdentifier={true}
                      />
                    </div>
                  )}
                  <div className={css.halfWidth}>
                    <MultiConfigSelectField
                      name="files"
                      allowableTypes={allowableTypes}
                      fileType={FILE_TYPE_VALUES.FILE_STORE}
                      formik={formik}
                      expressions={expressions}
                      fileUsage={FileUsage.MANIFEST_FILE}
                      values={formik.values.files}
                      multiTypeFieldSelectorProps={{
                        disableTypeSelection: false,
                        label: (
                          <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600}>
                            {isOnlyFileTypeManifest
                              ? getString('common.git.filePath')
                              : getString('fileFolderPathText')}
                          </Text>
                        )
                      }}
                      restrictToSingleEntry={selectedManifest ? shouldAllowOnlyOneFilePath(selectedManifest) : false}
                    />
                  </div>
                  {showValuesPaths(selectedManifest as ManifestTypes) && (
                    <div className={css.halfWidth}>
                      <MultiConfigSelectField
                        name="valuesPaths"
                        fileType={FILE_TYPE_VALUES.FILE_STORE}
                        formik={formik}
                        expressions={expressions}
                        fileUsage={FileUsage.MANIFEST_FILE}
                        allowableTypes={allowableTypes}
                        values={formik.values.valuesPaths}
                        multiTypeFieldSelectorProps={{
                          disableTypeSelection: false,
                          label: (
                            <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600}>
                              {getString('pipeline.manifestType.valuesYamlPath')}
                            </Text>
                          )
                        }}
                        restrictToSingleEntry={selectedManifest ? shouldAllowOnlyOneFilePath(selectedManifest) : false}
                        allowSinglePathDeletion
                      />
                    </div>
                  )}
                  {showParamsPaths(selectedManifest as ManifestTypes) && (
                    <div className={css.halfWidth}>
                      <MultiConfigSelectField
                        name="paramsPaths"
                        allowableTypes={allowableTypes}
                        fileType={FILE_TYPE_VALUES.FILE_STORE}
                        formik={formik}
                        expressions={expressions}
                        fileUsage={FileUsage.MANIFEST_FILE}
                        values={formik.values.paramsPaths}
                        multiTypeFieldSelectorProps={{
                          disableTypeSelection: false,
                          label: <Text>{getString('pipeline.manifestType.paramsYamlPath')}</Text>
                        }}
                        restrictToSingleEntry={selectedManifest ? shouldAllowOnlyOneFilePath(selectedManifest) : false}
                        allowSinglePathDeletion
                      />
                    </div>
                  )}
                  {showSkipResourceVersion(selectedManifest as ManifestTypes) && (
                    <ManifestDetailsAdvancedSection
                      formik={formik}
                      expressions={expressions}
                      allowableTypes={allowableTypes}
                      initialValues={initialValues}
                      isReadonly={isReadonly}
                      selectedManifest={selectedManifest}
                    />
                  )}
                </div>

                <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                  <Button
                    variation={ButtonVariation.SECONDARY}
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => previousStep?.(modifiedPrevStepData)}
                  />
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('submit')}
                    rightIcon="chevron-right"
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default HarnessFileStore
