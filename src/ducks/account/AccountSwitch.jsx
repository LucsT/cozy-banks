import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import compose from 'lodash/flowRight'
import sortBy from 'lodash/sortBy'
import cx from 'classnames'

import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import useBreakpoints from 'cozy-ui/transpiled/react/hooks/useBreakpoints'
import Icon from 'cozy-ui/transpiled/react/Icon'
import Button from 'cozy-ui/transpiled/react/Button'
import List from 'cozy-ui/transpiled/react/MuiCozyTheme/List'
import ListItem from 'cozy-ui/transpiled/react/MuiCozyTheme/ListItem'
import ListItemIcon from 'cozy-ui/transpiled/react/MuiCozyTheme/ListItemIcon'
import ListSubheader from 'cozy-ui/transpiled/react/MuiCozyTheme/ListSubheader'
import ListItemSecondaryAction from 'cozy-ui/transpiled/react/MuiCozyTheme/ListItemSecondaryAction'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'
import Radio from 'cozy-ui/transpiled/react/Radio'

import { createStructuredSelector } from 'reselect'

import RawContentDialog from 'components/RawContentDialog'
import AccountSharingStatus from 'components/AccountSharingStatus'
import AccountIcon from 'components/AccountIcon'
import BarItem from 'components/BarItem'
import CozyTheme, { useCozyTheme } from 'cozy-ui/transpiled/react/CozyTheme'

import {
  filterByDoc,
  getFilteringDoc,
  resetFilterByDoc,
  getFilteredAccounts
} from 'ducks/filters'

import styles from 'ducks/account/AccountSwitch.styl'
import { ACCOUNT_DOCTYPE, GROUP_DOCTYPE } from 'doctypes'
import { queryConnect, Q } from 'cozy-client'
import { getGroupLabel } from 'ducks/groups/helpers'

import { getVirtualGroups } from 'selectors'
import {
  getAccountInstitutionLabel,
  getAccountLabel
} from 'ducks/account/helpers.js'

import { BarCenter } from 'components/Bar'

import BottomIcon from 'cozy-ui/transpiled/react/Icons/Bottom'

import Typography from 'cozy-ui/transpiled/react/Typography'

const filteringDocPropType = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object
])

const DownArrow = ({ size }) => {
  const theme = useCozyTheme()
  return (
    <Icon
      width={size}
      height={size}
      icon={BottomIcon}
      className={cx(styles.DownArrow, styles[`DownArrowColor_${theme}`])}
    />
  )
}

DownArrow.defaultProps = {
  size: 12
}

const getFilteringDocLabel = (filteringDoc, t, accounts) => {
  if (filteringDoc.length) {
    return t('AccountSwitch.some_accounts', {
      count: filteringDoc.length,
      smart_count: accounts.length
    })
  } else if (filteringDoc._type === ACCOUNT_DOCTYPE) {
    return getAccountLabel(filteringDoc)
  } else if (filteringDoc._type === GROUP_DOCTYPE) {
    return getGroupLabel(filteringDoc, t)
  }
}

const defaultTypographyProps = {
  color: 'primary',
  variant: 'h4'
}

// t is passed from above and not through useI18n() since AccountSwitchSelect can be
// rendered in the Bar and in this case it has a different context
const AccountSwitchSelect = ({
  accounts,
  filteringDoc,
  onClick,
  t,
  typographyProps,
  arrowProps
}) => {
  const noAccounts = !accounts || accounts.length === 0

  return (
    <div className={styles.AccountSwitch__Select} onClick={onClick}>
      <Typography
        className={styles.AccountSwitch__SelectText}
        {...defaultTypographyProps}
        {...typographyProps}
      >
        {noAccounts
          ? t('Categories.noAccount')
          : filteringDoc
          ? getFilteringDocLabel(filteringDoc, t, accounts)
          : t('AccountSwitch.all_accounts')}
      </Typography>
      <DownArrow {...arrowProps} />
    </div>
  )
}

AccountSwitchSelect.propTypes = {
  t: PropTypes.func.isRequired
}

const accountListItemTextTypo2Props = {
  variant: 'caption',
  color: 'textSecondary'
}

const AccountListItemText = ({ primary, secondary }) => {
  return (
    <ListItemText
      primary={primary}
      secondary={secondary}
      secondaryTypographyProps={accountListItemTextTypo2Props}
    />
  )
}

const AccountSwitchListItem = props => {
  return (
    <ListItem {...props}>
      {props.children}
      <ListItemSecondaryAction className="u-pr-1">
        <Radio onClick={props.onClick} checked={props.selected} readOnly />
      </ListItemSecondaryAction>
    </ListItem>
  )
}

const AccountSwitchMenu = ({
  accounts,
  groups,
  filteringDoc,
  filterByDoc,
  resetFilterByDoc,
  close
}) => {
  const { t } = useI18n()

  const handleReset = () => {
    resetFilterByDoc()
  }

  const accountExists = useCallback(
    accountId => {
      return accounts.find(account => account.id === accountId)
    },
    [accounts]
  )

  return (
    <CozyTheme theme="normal">
      <List>
        <ListSubheader>{t('AccountSwitch.groups')}</ListSubheader>
        <AccountSwitchListItem
          dense
          button
          disableRipple
          onClick={handleReset}
          selected={filteringDoc === undefined}
        >
          <AccountListItemText
            primary={t('AccountSwitch.all_accounts')}
            secondary={
              <>{t('AccountSwitch.account_counter', accounts.length)}</>
            }
          />
        </AccountSwitchListItem>
        {sortBy(groups, 'label').map(group => (
          <AccountSwitchListItem
            dense
            key={group._id}
            button
            disableRipple
            selected={filteringDoc && group._id === filteringDoc._id}
            onClick={() => {
              filterByDoc(group)
            }}
          >
            <AccountListItemText
              primary={getGroupLabel(group, t)}
              secondary={
                <>
                  {t(
                    'AccountSwitch.account_counter',
                    group.accounts.data.filter(
                      account => account && accountExists(account.id)
                    ).length
                  )}
                </>
              }
            />
          </AccountSwitchListItem>
        ))}
      </List>
      <Link to={'/settings/groups'} onClick={close}>
        <Button
          className="u-m-half"
          theme="text"
          label={t('Groups.manage-groups')}
        />
      </Link>

      <List>
        <ListSubheader>{t('AccountSwitch.accounts')}</ListSubheader>
        {sortBy(accounts, ['institutionLabel', 'label']).map(
          (account, index) => (
            <AccountSwitchListItem
              key={index}
              button
              disableRipple
              dense
              onClick={() => {
                filterByDoc(account)
              }}
              selected={filteringDoc && account._id === filteringDoc._id}
            >
              <ListItemIcon>
                <AccountIcon account={account} />
              </ListItemIcon>
              <AccountListItemText
                primary={account.shortLabel || account.label}
                secondary={getAccountInstitutionLabel(account)}
              />
              <ListItemSecondaryAction>
                <AccountSharingStatus tooltip account={account} />
              </ListItemSecondaryAction>
            </AccountSwitchListItem>
          )
        )}
      </List>
      <Link to="/settings/accounts" onClick={close}>
        <Button
          className="u-m-half"
          theme="text"
          label={t('Accounts.manage-accounts')}
        />
      </Link>
    </CozyTheme>
  )
}

AccountSwitchMenu.propTypes = {
  filterByDoc: PropTypes.func.isRequired,
  resetFilterByDoc: PropTypes.func.isRequired,
  filteringDoc: filteringDocPropType
}

const AccountSwitchWrapper = ({ children }) => {
  return <div className={cx(styles['account-switch'])}>{children}</div>
}

const barItemStyle = { overflow: 'hidden', paddingRight: '1rem' }

const selectPropsBySize = {
  normal: {
    typographyProps: {
      variant: 'body1',
      color: 'primary'
    }
  },
  large: {
    typographyProps: {
      variant: 'h4',
      color: 'primary'
    },
    arrowProps: {
      size: 16
    }
  },
  small: {
    typographyProps: {
      variant: 'caption',
      color: 'primary'
    },
    arrowProps: {
      size: 10
    }
  }
}

// Note that everything is set up to be able to combine filters (even the redux store).
// It's only limited to one filter in a few places, because the UI can only accomodate one right now.
const AccountSwitch = props => {
  const {
    filteringDoc,
    filterByDoc,
    filteredAccounts,
    resetFilterByDoc,
    size,
    accounts: accountsCollection,
    groups: groupsCollection,
    virtualGroups,
    insideBar
  } = props
  const [open, setOpen] = useState()
  const { t } = useI18n()
  const { isMobile } = useBreakpoints()

  const handleToggle = useCallback(() => setOpen(open => !open), [setOpen])
  const handleClose = useCallback(() => setOpen(false), [setOpen])

  const accounts = accountsCollection.data
  const groups = [...groupsCollection.data, ...virtualGroups].map(group => ({
    ...group,
    label: getGroupLabel(group, t)
  }))

  const closeAfterSelect = cb => param => {
    cb(param)
    handleClose()
  }

  // TODO remove if https://github.com/cozy/cozy-client/issues/834 is solved
  // It seems there is a bug in cozy-client when we delete a document
  // The document is removed in the store, but still referenced in the collection
  // So we may get an undefined group. We filter it before sorting
  const orderedGroups = sortBy(groups.filter(Boolean), x =>
    x.label.toLowerCase()
  )

  const selectProps = selectPropsBySize[size]
  const select = (
    <AccountSwitchSelect
      accounts={accounts}
      filteredAccounts={filteredAccounts}
      filteringDoc={filteringDoc}
      onClick={handleToggle}
      t={t}
      {...selectProps}
    />
  )
  return (
    <AccountSwitchWrapper>
      {isMobile && insideBar !== false ? (
        <BarCenter>
          <BarItem style={barItemStyle}>{select}</BarItem>
        </BarCenter>
      ) : (
        select
      )}
      {open && (
        <RawContentDialog
          open={true}
          onClose={handleClose}
          title={t('AccountSwitch.title')}
          content={
            <AccountSwitchMenu
              filteringDoc={filteringDoc}
              filterByDoc={closeAfterSelect(filterByDoc)}
              resetFilterByDoc={closeAfterSelect(resetFilterByDoc)}
              close={handleClose}
              groups={orderedGroups}
              accounts={accounts}
            />
          }
        />
      )}
    </AccountSwitchWrapper>
  )
}

AccountSwitch.propTypes = {
  filterByDoc: PropTypes.func.isRequired,
  resetFilterByDoc: PropTypes.func.isRequired,
  filteringDoc: filteringDocPropType
}

AccountSwitch.defaultProps = {
  size: 'large',
  insideBar: true
}

const mapStateToProps = createStructuredSelector({
  filteringDoc: getFilteringDoc,
  filteredAccounts: getFilteredAccounts,
  virtualGroups: getVirtualGroups
})

const mapDispatchToProps = dispatch => ({
  resetFilterByDoc: () => dispatch(resetFilterByDoc()),
  filterByDoc: doc => dispatch(filterByDoc(doc))
})

export default compose(
  queryConnect({
    accounts: { query: () => Q(ACCOUNT_DOCTYPE), as: 'accounts' },
    groups: { query: () => Q(GROUP_DOCTYPE), as: 'groups' }
  }),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(AccountSwitch)
