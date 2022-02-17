/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Link } from 'react-router-dom'

import userEvent from '@testing-library/user-event'
import routes from '@common/RouteDefinitions'
import { TemplateContextTestWrapper } from '@templates-library/utils/templateContextTestUtils'

import { TemplateStudio } from '../TemplateStudio'
import templateContextProps from './__mock__/templateContextProps.json'

const updateTemplate = jest.fn()
const updateTemplateView = jest.fn()

const testWrapperProps = {
  path: routes.toTemplateStudio({
    accountId: ':accountId',
    orgIdentifier: ':orgIdentifier',
    projectIdentifier: ':projectIdentifier',
    templateType: ':templateType',
    templateIdentifier: ':templateIdentifier'
  }),
  pathParams: {
    accountId: 'dummy',
    orgIdentifier: 'dummy',
    projectIdentifier: 'dummy',
    templateType: 'dummy',
    templateIdentifier: 'dummy'
  },
  queryParams: {
    versionLabel: 'dummy'
  }
}

describe('<TemplateStudio /> tests', () => {
  test('snapshot test for new template with git sync', () => {
    const newTemplateProps = {
      ...testWrapperProps,
      pathParams: {
        ...testWrapperProps.pathParams,
        templateIdentifier: '-1'
      },
      templateContextValues: {
        state: {
          template: null
        }
      }
    }
    const { container } = render(
      <TemplateContextTestWrapper {...(newTemplateProps as any)}>
        <TemplateStudio />
      </TemplateContextTestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot test for new template without git sync', () => {
    const newTemplateProps = {
      ...testWrapperProps,
      pathParams: {
        ...testWrapperProps.pathParams,
        templateIdentifier: '-1'
      },
      templateContextValues: {
        state: {
          template: null
        }
      }
    }
    const { container } = render(
      <TemplateContextTestWrapper {...(newTemplateProps as any)} isGitSyncEnabled={false}>
        <TemplateStudio />
      </TemplateContextTestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot test for template studio in visual view', () => {
    const { container } = render(
      <TemplateContextTestWrapper {...testWrapperProps}>
        <TemplateStudio />
      </TemplateContextTestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('view change toggling in template studio', () => {
    /**
     * View change to yaml loads yaml builder
     * View change back to visual checks if valid yaml has been entered
     * Click on same view does not trigger any change
     */
    const { container } = render(
      <TemplateContextTestWrapper
        {...testWrapperProps}
        templateContextValues={{
          updateTemplate: updateTemplate,
          updateTemplateView: updateTemplateView
        }}
      >
        <TemplateStudio />
      </TemplateContextTestWrapper>
    )

    const toggle = container.querySelector('[data-name="toggle-option-two"]')
    userEvent.click(toggle!)
    expect(toggle?.className).toContain('PillToggle--selected')

    const toggle2 = container.querySelector('[data-name="toggle-option-one"]')
    userEvent.click(toggle2!)
    waitFor(() => expect(toggle2?.className).toContain('PillToggle--selected'))

    userEvent.click(toggle2!)
    waitFor(() => expect(toggle2?.className).not.toEqual('PillToggle--item'))
  })

  test('is template studio loading', async () => {
    const { container } = render(
      <TemplateContextTestWrapper {...testWrapperProps} templateContextValues={{ state: { isLoading: true } as any }}>
        <TemplateStudio />
      </TemplateContextTestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[data-icon="steps-spinner"]')).not.toBeNull())
  })

  test('navigation on unsaved changes should give warning', async () => {
    const { container, getByText } = render(
      <TemplateContextTestWrapper {...testWrapperProps} templateContextValues={{ ...(templateContextProps as any) }}>
        <TemplateStudio />
        <Link
          className="redirect"
          to={routes.toTriggersPage({
            projectIdentifier: 'projectIdentifier',
            orgIdentifier: 'orgIdentifier',
            pipelineIdentifier: 'pipelineIdentifier',
            accountId: 'accountId',
            module: 'cd'
          })}
        >
          Redirect
        </Link>
      </TemplateContextTestWrapper>
    )

    const nameField = getByText('Test_ash')
    expect(nameField).toBeDefined()

    const redirectButton = container.querySelector('[class*="redirect"]')
    if (!redirectButton) {
      throw Error('redirect button')
    }
    fireEvent.click(redirectButton)

    await waitFor(() => expect(document.body.querySelector('[class*="dialog"]')).not.toBeNull())
    expect(document.body.querySelector('[data-icon="warning-icon"]')).not.toBeNull()
  })
})

describe('yaml validation in template studio', () => {
  test('yaml parsed but error in validation', () => {
    const errorMap = new Map()
    errorMap.set(1, 'err1')
    errorMap.set(2, 'err2')

    const { container } = render(
      <TemplateContextTestWrapper
        {...testWrapperProps}
        templateContextValues={{
          state: {
            yamlHandler: {
              getLatestYaml: () => '---\template:\n  name: "uFXrIYA7TwyPav9UkH2s2w',
              getYAMLValidationErrorMap: () => errorMap
            }
          } as any
        }}
      >
        <TemplateStudio />
      </TemplateContextTestWrapper>
    )

    const toggle = container.querySelector('[data-name="toggle-option-two"]')
    userEvent.click(toggle!)
    expect(toggle?.className).toContain('PillToggle--selected')

    const toggle2 = container.querySelector('[data-name="toggle-option-one"]')
    userEvent.click(toggle2!)
    waitFor(() => expect(toggle2?.className).toContain('PillToggle--selected'))

    userEvent.click(toggle2!)
    waitFor(() => expect(toggle2?.className).not.toEqual('PillToggle--item'))
  })
})
