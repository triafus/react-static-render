/**
 * This is a playground file for local testing of the library.
 * You can build your dummy components here to test them with the hook locally.
 */
import React from 'react';

export default function Button({ children }: { children?: React.ReactNode }) {
  return (
    <button style={{ padding: '8px 16px', margin: '4px' }}>
      {children || 'Test Button'}
    </button>
  );
}
