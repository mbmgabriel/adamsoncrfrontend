import React from 'react';
import { Spinner } from 'react-bootstrap';

const TransparentLoader = () => {
  return (
    <div className='loader-container'>
    <Spinner animation="border" size='xl' role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
    </div>
  );
};

export default TransparentLoader;