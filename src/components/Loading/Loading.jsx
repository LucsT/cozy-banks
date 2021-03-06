import React from 'react'
import { Spinner, useI18n } from 'cozy-ui/transpiled/react'
import styles from 'components/Loading/Loading.styl'

/**
 * Use it for the loading of page/section
 */
export const Loading = ({ loadingType, noMargin, spinnerSize }) => {
  const { t } = useI18n()
  return (
    <div className={styles['bnk-loading']}>
      <Spinner size={spinnerSize} noMargin={noMargin} />
      {loadingType && <p>{t('Loading.loading')}</p>}
    </div>
  )
}

Loading.defaultProps = {
  spinnerSize: 'xxlarge'
}

export default Loading
