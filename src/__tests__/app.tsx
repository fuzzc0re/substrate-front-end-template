// Commenting test out as it seems currently polkadot-js api is not compatible with jest
//   and will always cause `SyntaxError: Cannot use import statement outside a module`.
// See: https://github.com/polkadot-js/api/issues/3430

// import React from 'react';
// import ReactDOM from 'react-dom';

// import App from '../app';

describe('App Test Suite', () => {
  it('renders without crashing', () => {
    // document.createElement('div');
    // ReactDOM.render(<App />, div);
  });
});

// Empty export is required if there are no imports
export {};
