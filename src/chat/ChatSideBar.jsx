import React from 'react'
import { Avatar, Icon } from '../components'
import { useGlobal } from './context'
import styles from './style/sider.module'
import { classnames } from '../components/utils'
import { useOptions } from './hooks'
import { Tooltip } from 'antd'
import  danoralogo  from '../assets/images/danoralogo.png'


export function ChatSideBar() {
  const { is, setState, options } = useGlobal()
  const { setGeneral } = useOptions()
  return (
    <div className={classnames(styles.sider, 'flex-c-sb flex-column')}>
    {/* <Avatar/> */}
      <img 
        src={danoralogo}
        alt="Danora Logo"
        style={{
          width: '40px',
          height: '40px',
          objectFit: 'contain',
          margin: '4px'
        }}
      />
      <div className={classnames(styles.tool, 'flex-c-sb flex-column')}>
        <Tooltip title="Show Personas" placement="right">
          <Icon 
            className={styles.icon} 
            type="apps" 
            onClick={() => setState({ is: { ...is, apps: true } })}
          />
        </Tooltip>
        {/* <Tooltip title="Show Conversations" placement="right">
          <Icon 
            className={styles.icon} 
            type="history" 
            onClick={() => {
              // setState({ is: { ...is, apps: false } }); //all conversations of all personas
              setState({ is: { ...is, drawerVisible: true } }); //all conversations of current persona
            }}
          />
        </Tooltip> */}
        {/* <Tooltip title={`Switch to ${options.general.theme === 'light' ? 'Dark' : 'Light'} Theme`} placement="right">
          <Icon 
            className={styles.icon} 
            type={options.general.theme} 
            onClick={() => setGeneral({ theme: options.general.theme === 'light' ? 'dark' : 'light' })}
          />
        </Tooltip> */}
        {/* <Icon 
          className={styles.icon} 
          type="config" 
          onClick={() => setState({ is: { ...is, config: !is.config } })}
          title="Settings"
        /> */}
        {/* <Icon 
          className={styles.icon} 
          type={`${is.fullScreen ? 'min' : 'full'}-screen`} 
          onClick={() => setState({ is: { ...is, fullScreen: !is.fullScreen } })}
          title={`${is.fullScreen ? 'Exit' : 'Enter'} Full Screen`}
        /> */}
      </div>
    </div>
  )
}
