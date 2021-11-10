import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from 'formik'
import { FormikForm } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { initialFormData } from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import type { StringKeys } from 'framework/strings'
import SLOTargetAndBudgetPolicy from '../SLOTargetAndBudgetPolicy'
import { getPeriodLengthOptions, getPeriodTypeOptions, getUpdatedTarget } from '../SLOTargetAndBudgetPolicy.utils'
import type { SLOForm } from '../../../CreateSLO.types'
import { periodLengthOptions } from './SLOTargetAndBudgetPolicy.mock'

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper>
      <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={jest.fn()}>
        {formikProps => {
          return (
            <FormikForm>
              <SLOTargetAndBudgetPolicy formikProps={formikProps}>
                <></>
              </SLOTargetAndBudgetPolicy>
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Test SLOTargetAndBudgetPolicy component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render SLOTargetAndBudgetPolicy component', async () => {
    const { container } = render(<WrapperComponent initialValues={initialFormData} />)
    expect(container).toMatchSnapshot()
  })

  test('verify getPeriodTypeOptions method', async () => {
    expect(getPeriodTypeOptions(getString)).toEqual([
      {
        label: 'cv.slos.sloTargetAndBudget.periodTypeOptions.rolling',
        value: 'Rolling'
      },
      {
        label: 'cv.slos.sloTargetAndBudget.periodTypeOptions.calendar',
        value: 'Calender'
      }
    ])
  })

  test('verify getPeriodLengthOptions method', async () => {
    expect(getPeriodLengthOptions()).toEqual(periodLengthOptions)
  })

  test('verify getUpdatedTarget method', async () => {
    expect(getUpdatedTarget([1635914774678 as any, 1636001240860 as any], initialFormData as SLOForm)).toEqual({
      sloTargetPercentage: 10,
      spec: {
        endDate: '2021-11-04',
        periodLength: '',
        startDate: '2021-11-03'
      },
      type: ''
    })
  })
})
