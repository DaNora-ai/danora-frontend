import React from 'react';
import styles from './search.module';
import { classnames } from '../utils';

export function Search(props) {
  const { className } = props;

  return (
    <div className={classnames(styles.search, className)}>
      <img 
        src="https://danora.ai/wp-content/uploads/2023/09/Danora-Logo-Blue-_-White-BG-removebg-preview.png"
        alt="Danora Logo"
        style={{
          width: '100%',
          height: '35px',
          objectFit: 'contain',
          margin: '4px',
        }}
      />
    </div>
  );
}

// Remove unused props
Search.defaultProps = {};

