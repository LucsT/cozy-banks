import React from 'react'
import icon from 'assets/icons/actions/icon-link-out.svg'
import Chip from 'cozy-ui/transpiled/react/Chip'
import Icon from 'cozy-ui/transpiled/react/Icon'

import ListItem from 'cozy-ui/transpiled/react/MuiCozyTheme/ListItem'
import ListItemIcon from 'cozy-ui/transpiled/react/MuiCozyTheme/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'

import palette from 'cozy-ui/transpiled/react/palette'

import OpenwithIcon from 'cozy-ui/transpiled/react/Icons/Openwith'

const name = 'url'

const transactionModalRowStyle = { color: palette.dodgerBlue }
const Component = ({ transaction, isModalItem }) => {
  const action = transaction.action

  if (isModalItem) {
    return (
      <ListItem
        onClick={() => open(action.url, action.target)}
        style={transactionModalRowStyle}
      >
        <ListItemIcon>
          <Icon icon={OpenwithIcon} />
        </ListItemIcon>
        <ListItemText>{action.trad}</ListItemText>
      </ListItem>
    )
  }

  return (
    <Chip
      size="small"
      variant="outlined"
      onClick={() => open(action.url, action.target)}
    >
      {action.trad}
      <Chip.Separator />
      <Icon icon={OpenwithIcon} />
    </Chip>
  )
}

const action = {
  name,
  icon,
  match: transaction => {
    return (
      transaction.action &&
      transaction.action.type &&
      transaction.action.type === name
    )
  },
  Component
}

export default action
