import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Media, Bd, Img, Icon, useI18n } from 'cozy-ui/transpiled/react'
import resultWithArgs from 'utils/resultWithArgs'
import { markdownBold } from './helpers'

import useConfirmation from 'components/useConfirmation'
import SettingCard from 'components/SettingCard'
import Switch from 'cozy-ui/transpiled/react/MuiCozyTheme/Switch'
import EditionModal from 'components/EditionModal'

import CrossIcon from 'cozy-ui/transpiled/react/Icons/Cross'

export const Cross = ({ onClick }) => (
  <span onClick={onClick} className="u-expanded-click-area">
    <Icon color="var(--coolGrey)" icon={CrossIcon} />
  </span>
)

export const SettingCardRemoveConfirmation = ({
  onRemove,
  description,
  title
}) => {
  const { component, requestOpen } = useConfirmation({
    onConfirm: onRemove,
    title: title,
    description: description
  })
  return (
    <>
      <Cross onClick={requestOpen} />
      {component}
    </>
  )
}

// Since the toggle has a large height, we need to compensate negatively
// so that the height of the switch does not impact the height of the card
const toggleStyle = { margin: '-8px 0' }

const resolveDescriptionKey = props => {
  const propArgs = [props]
  const descriptionKeyStr = resultWithArgs(props, 'descriptionKey', propArgs)
  const descriptionProps =
    resultWithArgs(props, 'descriptionProps', propArgs) || props.doc

  return props.t(descriptionKeyStr, descriptionProps)
}

const SettingCardSwitch = ({ checked, onClick, onChange }) => (
  <Switch
    disableRipple
    className="u-mh-s"
    checked={checked}
    color="primary"
    onClick={onClick}
    onChange={onChange}
  />
)

const EditableSettingCard = props => {
  const { t } = useI18n()
  const {
    onChangeDoc,
    onToggle,
    onRemove,
    removeModalTitle,
    removeModalDescription,
    editModalProps,
    shouldOpenOnToggle,
    doc,
    canBeRemoved,
    onRemoveDoc,
    trackPageName
  } = props

  const enabled = doc.enabled
  const [editing, setEditing] = useState(false)
  const description = resolveDescriptionKey({ ...props, t })

  const handleSwitchChange = () => {
    const shouldOpen = shouldOpenOnToggle ? shouldOpenOnToggle(props) : false
    if (shouldOpen) {
      setEditing(true)
    } else {
      onToggle(!enabled)
    }
  }

  return (
    <>
      <SettingCard
        enabled={enabled}
        onClick={editModalProps ? () => setEditing(true) : null}
      >
        <Media className="u-row-xs" align="top">
          <Bd>
            <span
              dangerouslySetInnerHTML={{
                __html: markdownBold(description)
              }}
            />
          </Bd>
          {onToggle ? (
            <Img style={toggleStyle}>
              <SettingCardSwitch
                checked={enabled}
                onClick={e => e.stopPropagation()}
                onChange={handleSwitchChange}
              />
            </Img>
          ) : null}
          {onRemove ? (
            <Img>
              <SettingCardRemoveConfirmation
                title={removeModalTitle}
                description={removeModalDescription}
                onRemove={onRemove}
              />
            </Img>
          ) : null}
        </Media>
      </SettingCard>
      {editing ? (
        <EditionModal
          {...editModalProps}
          canBeRemoved={canBeRemoved}
          onRemove={onRemoveDoc}
          removeModalTitle={removeModalTitle}
          removeModalDescription={removeModalDescription}
          initialDoc={doc}
          onEdit={updatedDoc => {
            onChangeDoc(updatedDoc)
            setEditing(false)
          }}
          onDismiss={() => setEditing(false)}
          okButtonLabel={() => t('EditionModal.ok')}
          cancelButtonLabel={() => t('EditionModal.cancel')}
          removeButtonLabel={() => t('EditionModal.remove')}
          trackPageName={trackPageName}
        />
      ) : null}
    </>
  )
}

EditableSettingCard.propTypes = {
  doc: PropTypes.object.isRequired
}

export default EditableSettingCard
