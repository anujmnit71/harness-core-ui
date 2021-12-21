import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import AuditTrailFactory from '@audit-trail/factories/AuditTrailFactory'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, secretPathProps } from '@common/utils/routeUtils'

import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import SecretReferences from '@secrets/pages/secretReferences/SecretReferences'
import SecretDetailsHomePage from '@secrets/pages/secretDetailsHomePage/SecretDetailsHomePage'
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import SecretResourceModalBody from '@secrets/components/SecretResourceModalBody/SecretResourceModalBody'
import type { ModulePathParams, ProjectPathProps, SecretsPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'
import SecretResourceRenderer from '@secrets/components/SecretResourceRenderer/SecretResourceRenderer'
import { AccountSideNavProps } from '@common/RouteDestinations'
import type { ResourceDTO, ResourceScopeDTO } from 'services/audit'

RbacFactory.registerResourceTypeHandler(ResourceType.SECRET, {
  icon: 'res-secrets',
  label: 'common.secrets',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_SECRET]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_SECRET]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_SECRET]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.ACCESS_SECRET]: <String stringID="rbac.permissionLabels.access" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <SecretResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <SecretResourceRenderer {...props} />
})

AuditTrailFactory.registerResourceHandler('SECRET', {
  moduleIcon: {
    name: 'nav-settings',
    size: 30
  },
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScopeDTO) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    if (accountIdentifier) {
      return routes.toSecretDetails({
        orgIdentifier,
        accountId: accountIdentifier,
        projectIdentifier,
        secretId: resource.identifier
      })
    }
    return undefined
  }
})

const RedirectToSecretDetailHome = () => {
  const { accountId, projectIdentifier, orgIdentifier, secretId, module } = useParams<
    ProjectPathProps & SecretsPathProps & ModulePathParams
  >()
  return (
    <Redirect to={routes.toSecretDetailsOverview({ accountId, projectIdentifier, orgIdentifier, secretId, module })} />
  )
}

AuditTrailFactory.registerResourceHandler('SECRET', {
  moduleIcon: {
    name: 'nav-settings',
    size: 30
  },
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScopeDTO) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    if (accountIdentifier) {
      return routes.toSecretDetails({
        orgIdentifier,
        accountId: accountIdentifier,
        projectIdentifier,
        secretId: resource.identifier
      })
    }

    return null
  }
})

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toSecrets({ ...accountPathProps })} exact>
      <SecretsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toSecretDetails({
        ...accountPathProps,
        ...secretPathProps
      })}
      exact
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toSecretDetailsOverview({
        ...accountPathProps,
        ...secretPathProps
      })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toSecretDetailsReferences({
        ...accountPathProps,
        ...secretPathProps
      })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toCreateSecretFromYaml({ ...accountPathProps })}
      exact
    >
      <CreateSecretFromYamlPage />
    </RouteWithLayout>
  </>
)
export { RedirectToSecretDetailHome }
