

import React, { useState, useEffect } from 'react';
import { CheckIn, NetSession, Net, NetConfigType } from '../types';
import { formatRepeaterCondensed } from '../lib/time';
import Button from './Button';

interface EditCheckInModalProps {
  session: NetSession;
  net: Net;
  checkIn: CheckIn;
  onSave: (updatedCheckIn: CheckIn) => void;
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

const FormSelect = ({ label, id, children, ...props }: {label: string, id: string, children: React.ReactNode} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div>
      <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary mb-1">
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select id={id} {...props} className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11">
          {children}
      </select>
  </div>
);


const EditCheckInModal: React.FC<EditCheckInModalProps> = ({ session, net, checkIn, onSave, onClose }) => {
  const [formData, setFormData] = useState(checkIn);

  useEffect(() => {
      setFormData(checkIn);
  }, [checkIn]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const finalValue = name === 'call_sign' ? value.toUpperCase() : value;
      setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.call_sign) {
        alert("Call Sign is required.");
        return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
              <h2 className="text-xl font-bold text-dark-text">Edit Check-in</h2>
              <p className="text-sm text-dark-text-secondary">Editing log entry for session on {new Date(session.start_time).toLocaleDateString()}</p>
          </div>
          <div className="p-6 border-t border-b border-dark-700 space-y-4">
            <FormInput label="Call Sign" id="edit-callSign" name="call_sign" value={formData.call_sign} onChange={handleChange} required />
            <FormInput label="Name" id="edit-name" name="name" value={formData.name || ''} onChange={handleChange} />
            <FormInput label="Location" id="edit-location" name="location" value={formData.location || ''} onChange={handleChange} />
            {net.net_config_type === NetConfigType.LINKED_REPEATER && (
                 <FormSelect label="Repeater" id="edit-repeaterId" name="repeater_id" value={formData.repeater_id || ''} onChange={handleChange}>
                    <option value="">Select Repeater...</option>
                    {net.repeaters.map(r => <option key={r.id} value={r.id}>{formatRepeaterCondensed(r)}</option>)}
                </FormSelect>
            )}
            <FormInput label="Notes" id="edit-notes" name="notes" value={formData.notes || ''} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-4 p-4 bg-dark-800/50 rounded-b-lg">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCheckInModal;
