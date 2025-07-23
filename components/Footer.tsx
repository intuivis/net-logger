import React from 'react';
import { View } from '../types';
import { IntuivisLogo } from './icons/IntuivisLogo';
import { Icon } from '../components/Icon';

interface FooterProps {
  onSetView: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ onSetView }) => {
  return (
  <footer className="bg-dark-800 border-t border-dark-700 mt-auto">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Mobile: grid with 2 columns | Desktop: single flex row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 sm:gap-2 text-sm text-dark-text-secondary">

        {/* Links container */}
        <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-row sm:items-center sm:flex-wrap sm:text-left">

          <button
            onClick={() => onSetView({ type: 'userAgreement' })}
            className="hover:text-dark-text hover:underline transition-colors text-left"
          >
            User Agreement
          </button>

          <button
            onClick={() => onSetView({ type: 'releaseNotes' })}
            className="hover:text-dark-text hover:underline transition-colors text-left"
          >
            Release Notes
          </button>

          <a
            href="https://www.repeaterbook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-dark-text hover:underline transition-colors whitespace-nowrap"
          >
            RepeaterBook <Icon className="text-dark-text text-sm">open_in_new</Icon>
          </a>

          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSf7PqYcPFnt4j0GJM-KY1m9gaM8R6xI7bHNPm2xxxpY3uzjTw/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-dark-text hover:underline transition-colors whitespace-nowrap"
          >
            Feedback <Icon className="text-dark-text text-sm">open_in_new</Icon>
          </a>
        </div>

        {/* Branding */}
        <div className="flex justify-center sm:justify-end items-center gap-2">
          <span className="text-sm text-dark-text-secondary">Created by:</span>
          <a
            href="https://www.intuivis.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit Intuivis, LLC"
          >
            <IntuivisLogo />
          </a>
        </div>

      </div>
    </div>
  </footer>


  );
};

export default Footer;
