import React from 'react';

interface DropdownProps {
  children: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({ children }) => {
  return (
    <div className="jh-dropdown jh-dropdown-hover jh-dropdown-bottom jh-flex jh-flex-col jh-justify-center">
      <div
        tabIndex={0}
        role="button"
        className="jh-btn jh-btn-circle jh-btn-ghost jh-btn-xs jh-text-info"
      >
        <svg
          tabIndex={0}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="jh-h-4 jh-w-4 jh-stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>

      <div
        tabIndex={0}
        className="jh-dropdown-content menu jh-rounded-box jh-z-[1] jh-min-w-96 jh-p-2 jh-shadow jh-bg-base-content"
      >
        {children}
      </div>
    </div>
  );
};
