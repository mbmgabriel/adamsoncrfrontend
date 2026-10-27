import React from 'react';
import Loader from './Loader';

const TransparentLoader = () => {
  return (
    <div className='portal-loader-overlay'>
      <Loader />
    </div>
  );
};

export default TransparentLoader;
