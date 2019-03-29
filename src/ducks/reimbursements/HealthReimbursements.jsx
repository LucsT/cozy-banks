import React, { Component } from 'react'
import { connect } from 'react-redux'
import { queryConnect } from 'cozy-client'
import { transactionsConn } from 'doctypes'
import { flowRight as compose, sumBy } from 'lodash'
import { getHealthExpensesByPeriod } from 'ducks/filters'
import { TransactionsWithSelection } from 'ducks/transactions/Transactions'
import withBrands from 'ducks/brandDictionary/withBrands'
import withAppsUrls from 'ducks/apps/withAppsUrls'
import { isFullyReimbursed } from 'ducks/transactions/helpers'
import { translate } from 'cozy-ui/react'
import { Title } from 'cozy-ui/react/Text'
import { Padded } from 'components/Spacing'
import { Figure } from 'components/Figure'
import styles from 'ducks/reimbursements/HealthReimbursements.styl'

class RawHealthReimbursements extends Component {
  render() {
    const { filteredTransactions, t } = this.props

    const reimbursedTransactions = filteredTransactions.filter(
      isFullyReimbursed
    )

    const awaitingTransactions = filteredTransactions.filter(
      t => !isFullyReimbursed(t)
    )

    const awaitingAmount = sumBy(awaitingTransactions, t => -t.amount)

    return (
      <>
        <Padded>
          <Title>
            <Figure
              symbol="€"
              total={awaitingAmount}
              className={styles.HealthReimbursements__figure}
              signed
            />{' '}
            {t('Reimbursements.awaiting')}
          </Title>
        </Padded>
        <TransactionsWithSelection
          transactions={awaitingTransactions}
          brands={this.props.brands}
          urls={this.props.urls}
          withScroll={false}
          className={styles.HealthReimbursements__transactionsList}
        />
        <Padded>
          <Title>{t('Reimbursements.alreadyReimbursed')}</Title>
        </Padded>
        <TransactionsWithSelection
          transactions={reimbursedTransactions}
          brands={this.props.brands}
          urls={this.props.urls}
          withScroll={false}
          className={styles.HealthReimbursements__transactionsList}
        />
      </>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const enhancedState = {
    ...state,
    transactions: ownProps.transactions
  }

  return {
    filteredTransactions: getHealthExpensesByPeriod(enhancedState)
  }
}

const HealthReimbursements = compose(
  translate(),
  queryConnect({
    transactions: transactionsConn
  }),
  connect(mapStateToProps),
  withBrands,
  withAppsUrls
)(RawHealthReimbursements)

export default HealthReimbursements
