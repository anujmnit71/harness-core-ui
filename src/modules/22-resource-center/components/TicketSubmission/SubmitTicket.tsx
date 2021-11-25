import React, { FormEvent, useState } from 'react'
import cx from 'classnames'
import type { PaddingProps } from '@wings-software/uicore/dist/styled-props/padding/PaddingProps'
import css from '@resource-center/components/ResourceCenter/ResourceCenter.module.scss'
import newcss from './SubmitTicket.module.scss'
import {
  Button,
  Color,
  DropDown,
  FontVariation,
  Layout,
  Radio,
  RadioButton,
  Text,
  TextInput
} from '@wings-software/uicore'
//const

export const SubmitTicket = () => {
  const categoryTypes = ['Problem', 'Question', 'Feature request', 'Other'].map(item => {
    return {
      label: item,
      value: item
    }
  })
  enum Priority {
    LOW,
    NORMAL,
    HIGH,
    URGENT
  }
  const url = window.location.href
  const [category, setCategory] = useState(categoryTypes[0].value)
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState(Priority.LOW)
  console.log(url)

  const commonPadding = { left: 'xlarge', right: 'xlarge', bottom: 'large' } as PaddingProps
  const fontProps = { font: { variation: FontVariation.SMALL_SEMI }, color: Color.WHITE, padding: { bottom: 'xsmall' } }
  const optionDescProps = { font: { variation: FontVariation.TINY }, color: Color.WHITE, padding: { bottom: 'large' } }

  return (
    <Layout.Vertical width={440} className={css.resourceCenter}>
      <Layout.Vertical padding={'large'} flex={{ alignItems: 'baseline' }}>
        <Text color={Color.WHITE} padding={{ bottom: 'medium' }}>
          {'SUBMIT A TICKET'}
        </Text>
      </Layout.Vertical>
      <Layout.Vertical padding={commonPadding}>
        <Text {...fontProps}>{'Feedback Category'}</Text>
        <DropDown
          value={category}
          onChange={selected => setCategory(selected.label)}
          items={categoryTypes}
          width={125}
        />
      </Layout.Vertical>
      <Layout.Vertical padding={commonPadding} width={192}>
        <Text {...fontProps}>{'Email Address'}</Text>
        <TextInput
          defaultValue={email}
          placeholder={'develop@example.com'}
          onChange={(ch: React.ChangeEvent<HTMLInputElement>) => setEmail(ch.target.value.trim())}
          width={195}
        />
      </Layout.Vertical>
      <Layout.Vertical padding={commonPadding}>
        <Text {...fontProps}>{'Subject'}</Text>
        <TextInput
          defaultValue={subject}
          onChange={(ch: React.ChangeEvent<HTMLInputElement>) => setSubject(ch.target.value.trim())}
        />
      </Layout.Vertical>
      <Layout.Vertical padding={commonPadding}>
        <Text {...fontProps}>{'Message'}</Text>
        <TextInput
          defaultValue={message}
          onChange={(ch: React.ChangeEvent<HTMLInputElement>) => setMessage(ch.target.value.trim())}
          height={85}
        />
      </Layout.Vertical>
      <Layout.Vertical padding={commonPadding}>
        <Text {...fontProps}>{'Priority'}</Text>
        <div className={newcss.radiobuttongrid}>
          <Radio
            label="Low"
            checked={Priority.LOW === priority}
            {...fontProps}
            onChange={(event: FormEvent<HTMLInputElement>) => setPriority(Priority.LOW)}
            className={cx(newcss.radiolocation, newcss.low)}
          />
          <Text {...optionDescProps} className={cx(newcss.radiodescription, newcss.low)}>
            {'Minor loss of functionality, a workaround exists and normal operation can take place.'}
          </Text>

          <Radio
            label="Normal"
            checked={Priority.NORMAL === priority}
            {...fontProps}
            onChange={(event: FormEvent<HTMLInputElement>) => setPriority(Priority.NORMAL)}
            className={cx(newcss.radiolocation, newcss.normal)}
          />
          <Text {...optionDescProps} className={cx(newcss.radiodescription, newcss.normal)}>
            {'Minor loss of functionality, a workaround exists and normal operation can take place.'}
          </Text>

          <Radio
            label="High"
            checked={Priority.HIGH === priority}
            {...fontProps}
            onChange={(event: FormEvent<HTMLInputElement>) => setPriority(Priority.HIGH)}
            className={cx(newcss.radiolocation, newcss.high)}
          />
          <Text {...optionDescProps} className={cx(newcss.radiodescription, newcss.high)}>
            {
              'Major loss of functionality resulting in a high number of users unable to perform their normal functions. The platform is usable but severely limited.'
            }
          </Text>

          <Radio
            label="Urgent"
            checked={Priority.URGENT === priority}
            {...fontProps}
            onChange={(event: FormEvent<HTMLInputElement>) => setPriority(Priority.URGENT)}
            className={cx(newcss.radiolocation, newcss.urgent)}
          />
          <Text {...optionDescProps} className={cx(newcss.radiodescription, newcss.urgent)}>
            {
              'Harness is unavailable/down, no deployment can take place, or major malfunction resulting in a product inoperative condition. Users can not use Harness.'
            }
          </Text>
        </div>
      </Layout.Vertical>

      <Button>Submit a ticket</Button>
    </Layout.Vertical>
  )
}
