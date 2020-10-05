import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Color, Layout, Icon, Text } from '@wings-software/uikit'
import { routeCDDashboard } from 'modules/cd/routes'
import { routeCVMainDashBoardPage } from 'modules/cv/routes'
import { Project, usePutProject } from 'services/cd-ng'
import i18n from './ModuleRenderer.i18n'
import css from './ModuleRenderer.module.scss'

interface DefaultProps {
  data: Project
  isPreview?: boolean
}

const DefaultRenderer: React.FC<DefaultProps> = props => {
  const { data, isPreview } = props
  const { accountId } = useParams()
  const history = useHistory()
  const { mutate: updateProject } = usePutProject({
    identifier: '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: ''
    }
  })

  const onSelect = async (module: Required<Project>['modules'][number]): Promise<boolean> => {
    const dataToSubmit: Project = {
      ...data,
      modules: [module]
    }
    try {
      await updateProject(dataToSubmit, {
        pathParams: {
          identifier: data.identifier
        },
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: data.orgIdentifier
        }
      })
      return true
    } catch (e) {
      return false
    }
  }
  return (
    <Layout.Vertical
      padding={{ top: 'medium', left: 'xlarge', right: 'xlarge', bottom: 'large' }}
      border={{ top: true, bottom: true, color: Color.GREY_250 }}
      className={css.started}
    >
      <Text font="small" color={Color.BLACK} padding={{ bottom: 'xsmall' }}>
        {i18n.start}
      </Text>
      {isPreview ? (
        <Layout.Horizontal spacing="small">
          <Icon name="cd-hover" size={20} />
          <Icon name="nav-cv-hover" size={20} />
          <Icon name="ce-hover" size={20} />
        </Layout.Horizontal>
      ) : (
        <Layout.Horizontal spacing="small">
          <Icon
            name="cd-hover"
            size={20}
            onClick={() => {
              onSelect('CD')
              history.push(
                routeCDDashboard.url({
                  orgIdentifier: data.orgIdentifier as string,
                  projectIdentifier: data.identifier || ''
                })
              )
            }}
            className={css.pointer}
          />

          <Icon
            name="nav-cv-hover"
            size={20}
            onClick={() => {
              onSelect('CV')
              history.push(
                routeCVMainDashBoardPage.url({
                  orgIdentifier: data.orgIdentifier as string,
                  projectIdentifier: data.identifier || ''
                })
              )
            }}
            className={css.pointer}
          />
          <Icon name="ce-hover" size={20} />
        </Layout.Horizontal>
      )}
    </Layout.Vertical>
  )
}

export default DefaultRenderer
