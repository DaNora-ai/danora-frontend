import React from 'react'
import { Avatar, Icon } from '../components'
import { useGlobal } from './context'
import styles from './style/sider.module'
import { classnames } from '../components/utils'
import { useOptions } from './hooks'

export function ChatSideBar() {
  const { is, setState, options } = useGlobal()
  const { setGeneral } = useOptions()
  return (
    <div className={classnames(styles.sider, 'flex-c-sb flex-column')}>
      <Avatar />
      <div className={classnames(styles.tool, 'flex-c-sb flex-column')}>
        <Icon 
          className={styles.icon} 
          type="apps" 
          onClick={() => setState({ is: { ...is, apps: true } })}
          title="Show Personas" 
        />
        <Icon 
          className={styles.icon} 
          type="history" 
          onClick={() => setState({ is: { ...is, apps: false } })}
          title="Show Conversations"
        />
        <Icon 
          className={styles.icon} 
          type={options.general.theme} 
          onClick={() => setGeneral({ theme: options.general.theme === 'light' ? 'dark' : 'light' })}
          title={`Switch to ${options.general.theme === 'light' ? 'Dark' : 'Light'} Theme`}
        />
        <Icon 
          className={styles.icon} 
          type="config" 
          onClick={() => setState({ is: { ...is, config: !is.config } })}
          title="Settings"
        />
        <Icon 
          className={styles.icon} 
          type={`${is.fullScreen ? 'min' : 'full'}-screen`} 
          onClick={() => setState({ is: { ...is, fullScreen: !is.fullScreen } })}
          title={`${is.fullScreen ? 'Exit' : 'Enter'} Full Screen`}
        />
      </div>
    </div>
  )
}
