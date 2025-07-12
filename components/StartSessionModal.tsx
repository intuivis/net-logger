import React, { useState } from 'react';
import { Net, NetSession } from '../types';

interface StartSessionModalProps {
  net: Net;
  onStart: (net: Net, overrides: Partial<NetSession>) => void;
  onClose: () => void;
}

const FormInput = ({ label, id, ...props }: {label: string, id: string} & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary mb-1">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <input
            id={id}
            {...props}
            className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11"
        />
    </div>
);

const StartSessionModal: React.FC<StartSessionModalProps> = ({ net, onStart, onClose }) => {
  const [overrides, setOverrides] = useState({
      primary_nco: net.primary_nco,
      primary_nco_callsign: net.primary_nco_callsign,
      backup_nco: net.backup_nco,
      backup_nco_callsign: net.backup_nco_callsign,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const finalValue = name.toLowerCase().includes('callsign') ? value.toUpperCase() : value;
      setOverrides(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrides.primary_nco || !overrides.primary_nco_callsign) {
        alert("Primary NCO Name and Callsign are required for this session.");
        return;
    }
    onStart(net, overrides);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-2xl m-4" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
              <h2 className="text-xl font-bold text-dark-text">Start New Session for "{net.name}"</h2>
              <p className="text-sm text-dark-text-secondary">Confirm or override the Net Control Operators for this session.</p>
          </div>
          <div className="p-6 border-y border-dark-700 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput 
                    label="Primary NCO Name" 
                    id="session-primaryNCO" 
                    name="primary_nco" 
                    value={overrides.primary_nco} 
                    onChange={handleChange} 
                    required 
                />
                <FormInput 
                    label="Primary NCO Callsign" 
                    id="session-primaryNCOCallsign" 
                    name="primary_nco_callsign" 
                    value={overrides.primary_nco_callsign} 
                    onChange={handleChange} 
                    required 
                />
                <FormInput 
                    label="Backup NCO Name" 
                    id="session-backupNCO" 
                    name="backup_nco" 
                    value={overrides.backup_nco || ''} 
                    onChange={handleChange} 
                />
                 <FormInput 
                    label="Backup NCO Callsign" 
                    id="session-backupNCOCallsign" 
                    name="backup_nco_callsign" 
                    value={overrides.backup_nco_callsign || ''} 
                    onChange={handleChange} 
                />
             </div>
          </div>
          <div className="flex justify-end gap-4 p-4 bg-dark-800/50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-dark-text bg-dark-700 rounded-lg hover:bg-dark-600">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
              Confirm & Start Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartSessionModal;
