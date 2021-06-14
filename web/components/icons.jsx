import React from 'react';

const ArrowLeft = (props) => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ width: props.size, height: props.size }}>
    <path style={{ fill: props.color }} d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z" />
  </svg>
);

export {
  // eslint-disable-next-line import/prefer-default-export
  ArrowLeft,
};
