import React, { Component } from 'react'
import { connect } from 'react-redux'
import { queryConnect } from 'cozy-client'
import { transactionsConn } from 'doctypes'
import { flowRight as compose, sumBy } from 'lodash'
import cx from 'classnames'
import { TransactionList } from 'ducks/transactions/Transactions'
import { translate, useI18n } from 'cozy-ui/transpiled/react'
import { Padded } from 'components/Spacing'
import { Figure } from 'components/Figure'
import styles from 'ducks/reimbursements/Reimbursements.styl'
import Loading from 'components/Loading'
import { KonnectorChip } from 'components/KonnectorChip'
import { StoreLink } from 'components/StoreLink'
import { Section } from 'components/Section'
import withFilters from 'components/withFilters'
import { getYear } from 'date-fns'
import TransactionActionsProvider from 'ducks/transactions/TransactionActionsProvider'
import withBrands from 'ducks/brandDictionary/withBrands'
import { isCollectionLoading, hasBeenLoaded } from 'ducks/client/utils'
import { getGroupedFilteredExpenses } from './selectors'
import { getPeriod, parsePeriod, getFilteringDoc } from 'ducks/filters'
import { getCategoryName } from 'ducks/categories/categoriesMap'

const Caption = props => {
  const { className, ...rest } = props

  return <p className={cx(styles.Caption, className)} {...rest} />
}

const NoPendingReimbursements = ({ period, doc }) => {
  const { t } = useI18n()

  const categoryName = doc.categoryId ? getCategoryName(doc.categoryId) : null
  const message = categoryName
    ? t(`Reimbursements.noPending.${categoryName}`, { period })
    : t('Reimbursements.noPending.generic', { period })

  return (
    <Padded className="u-pv-0">
      <Caption>{message}</Caption>
    </Padded>
  )
}

const NoReimbursedExpenses = ({ hasHealthBrands, doc }) => {
  const { t } = useI18n()

  const categoryName = doc.categoryId ? getCategoryName(doc.categoryId) : null
  const message = categoryName
    ? t(`Reimbursements.noReimbursed.${categoryName}`)
    : t('Reimbursements.noReimbursed.generic')

  return (
    <Padded className="u-pv-0">
      <Caption>{message}</Caption>
      {!hasHealthBrands && categoryName === 'healthExpenses' && (
        <StoreLink type="konnector" category="insurance">
          <KonnectorChip konnectorType="health" />
        </StoreLink>
      )}
    </Padded>
  )
}

export class DumbReimbursements extends Component {
  componentDidMount() {
    this.props.addFilterByPeriod(getYear(new Date()).toString())
  }

  render() {
    const {
      groupedExpenses,
      t,
      f,
      triggers,
      transactions,
      brands,
      currentPeriod,
      filteringDoc
    } = this.props

    if (
      (isCollectionLoading(transactions) && !hasBeenLoaded(transactions)) ||
      (isCollectionLoading(triggers) && !hasBeenLoaded(triggers))
    ) {
      return <Loading loadingType />
    }

    const {
      reimbursed: reimbursedExpenses,
      pending: pendingExpenses
    } = groupedExpenses

    const pendingAmount = sumBy(pendingExpenses, t => -t.amount)

    const hasHealthBrands =
      brands.filter(brand => brand.hasTrigger && brand.health).length > 0

    const formattedPeriod = f(
      parsePeriod(currentPeriod),
      currentPeriod.length === 4 ? 'YYYY' : 'MMMM YYYY'
    )

    return (
      <TransactionActionsProvider>
        <div className={styles.Reimbursements}>
          <Section
            title={
              <>
                {t('Reimbursements.pending')}
                <Figure
                  symbol="€"
                  total={pendingAmount}
                  className={styles.Reimbursements__figure}
                  signed
                />{' '}
              </>
            }
          >
            {pendingExpenses && pendingExpenses.length > 0 ? (
              <TransactionList
                transactions={pendingExpenses}
                withScroll={false}
                className={styles.Reimbursements__transactionsList}
                showTriggerErrors={false}
              />
            ) : (
              <NoPendingReimbursements
                period={formattedPeriod}
                doc={filteringDoc}
              />
            )}
          </Section>
          <Section title={t('Reimbursements.alreadyReimbursed')}>
            {reimbursedExpenses && reimbursedExpenses.length > 0 ? (
              <TransactionList
                transactions={reimbursedExpenses}
                withScroll={false}
                className={styles.Reimbursements__transactionsList}
                showTriggerErrors={false}
              />
            ) : (
              <NoReimbursedExpenses
                hasHealthBrands={hasHealthBrands}
                doc={filteringDoc}
              />
            )}
          </Section>
        </div>
      </TransactionActionsProvider>
    )
  }
}

function mapStateToProps(state) {
  return {
    groupedExpenses: getGroupedFilteredExpenses(state),
    currentPeriod: getPeriod(state),
    filteringDoc: getFilteringDoc(state)
  }
}

const Reimbursements = compose(
  translate(),
  queryConnect({
    transactions: transactionsConn
  }),
  connect(mapStateToProps),
  withFilters,
  // We need to have a different query name otherwise we end with an infinite
  // loading
  withBrands({ queryName: 'reimbursementsPageTriggers' })
)(DumbReimbursements)

export default Reimbursements