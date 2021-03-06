import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { MainTitle } from 'cozy-ui/transpiled/react/Text'
import styles from 'components/Title/Title.styl'
import { useCozyTheme } from 'cozy-ui/transpiled/react/CozyTheme'

const Title = props => {
  const theme = useCozyTheme()
  const { children, className } = props

  return (
    <MainTitle
      tag="h1"
      ellipsis={true}
      className={cx(
        styles.Title,
        theme && styles[`TitleColor_${theme}`],
        className
      )}
    >
      {children}
    </MainTitle>
  )
}

Title.propTypes = {
  children: PropTypes.node.isRequired
}

export default Title
