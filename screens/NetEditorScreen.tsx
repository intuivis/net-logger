
import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Net, Repeater, NetType, DayOfWeek, NetConfigType, NET_CONFIG_TYPE_LABELS } from '../types';
import { NET_TYPE_OPTIONS, DAY_OF_WEEK_OPTIONS, TIME_ZONE_OPTIONS, NET_CONFIG_TYPE_OPTIONS } from '../constants';
import { Icon } from '../components/Icon';

interface NetEditorScreenProps {
  initialNet?: Net;
  onSave: (net: Partial<Net>) => void;
  onCancel: () => void;
}

const FormInput = ({ label, id, className, ...props }: {label: string, id: string} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary mb-1">
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input id={id} {...props} className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11" />
  </div>
);

const FormSelect = ({ label, id, children, className, ...props }: {label: string, id: string, children: React.ReactNode, className?: string} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary mb-1">
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select id={id} {...props} className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11">
          {children}
      </select>
  </div>
);

// Moved outside the main component to prevent re-creation on render, which was causing focus loss.
interface RepeaterInputSetProps {
  repeater: Repeater;
  index: number;
  configType: NetConfigType;
  repeaterCount: number;
  onUpdate: (index: number, field: keyof Omit<Repeater, 'id'>, value: string | 'plus' | 'minus' | 'none') => void;
  onRemove: (id: string) => void;
}

const RepeaterInputSet: React.FC<RepeaterInputSetProps> = React.memo(({
  repeater,
  index,
  configType,
  repeaterCount,
  onUpdate,
  onRemove,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-10 gap-3 items-center p-3 bg-dark-900/50 rounded-md">
      <FormInput
        className="md:col-span-4"
        label="Name"
        id={`r-name-${index}`}
        type="text" value={repeater.name}
        onChange={e => onUpdate(index, 'name', e.target.value)}
        placeholder="e.g., Mountain Top"
        required={configType === NetConfigType.LINKED_REPEATER}
      />
      <FormInput
        className="md:col-span-2"
        label="Freq (MHz)"
        id={`r-freq-${index}`}
        type="text"
        value={repeater.frequency}
        onChange={e => onUpdate(index, 'frequency', e.target.value)}
        placeholder="e.g., 146.520"
        required
      />
      <FormInput
        className="md:col-span-2"
        label="Tone (Hz)"
        id={`r-tone-${index}`}
        type="text"
        value={repeater.tone}
        onChange={e => onUpdate(index, 'tone', e.target.value)}
        placeholder="e.g., 100.0"
      />
      <FormSelect
        className="md:col-span-1"
        label="Offset"
        id={`r-offset-${index}`}
        value={repeater.tone_offset || 'none'}
        onChange={e => onUpdate(index, 'tone_offset', e.target.value as 'plus' | 'minus' | 'none')}
      >
        <option value="none">&nbsp;</option>
        <option value="plus">+</option>
        <option value="minus">-</option>
      </FormSelect>
      <div className="md:col-span-1 flex items-end h-full justify-end pt-5">
          {configType === NetConfigType.LINKED_REPEATER && repeaterCount > 1 && (
              <button type="button" onClick={() => onRemove(repeater.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors">
                  <Icon className="text-xl">delete</Icon>
              </button>
          )}
      </div>
  </div>
));


const NetEditorScreen: React.FC<NetEditorScreenProps> = ({ initialNet, onSave, onCancel }) => {
  const [net, setNet] = useState<Partial<Net>>(() => {
    const baseNet = initialNet || {
      name: '',
      description: '',
      website_url: '',
      primary_nco: '',
      primary_nco_callsign: '',
      backup_nco: '',
      backup_nco_callsign: '',
      net_type: NetType.TECHNICAL,
      schedule: DayOfWeek.TUESDAY,
      time: '19:00',
      time_zone: 'America/New_York',
      net_config_type: NetConfigType.SINGLE_REPEATER,
      repeaters: [],
      frequency: '',
      band: '',
      mode: ''
    };

    // Ensure there's always at least one repeater object for repeater-based nets
    if ((baseNet.net_config_type === NetConfigType.SINGLE_REPEATER || baseNet.net_config_type === NetConfigType.LINKED_REPEATER) && (!baseNet.repeaters || baseNet.repeaters.length === 0)) {
        baseNet.repeaters = [{ id: uuidv4(), name: '', frequency: '', tone: '', tone_offset: 'none' }];
    }

    return baseNet;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const finalValue = name.toLowerCase().includes('callsign') ? value.toUpperCase() : value;
    
    setNet(prev => ({ ...prev, [name]: finalValue }));
  };

  const addRepeater = useCallback(() => {
    setNet(prev => ({
      ...prev,
      repeaters: [...(prev.repeaters || []), { id: uuidv4(), name: '', frequency: '', tone: '', tone_offset: 'none' }],
    }));
  }, []);

  const updateRepeater = useCallback((index: number, field: keyof Omit<Repeater, 'id'>, value: string | 'plus' | 'minus' | 'none') => {
    setNet(prev => {
      const newRepeaters = [...(prev.repeaters || [])];
      if (newRepeaters[index]) {
        newRepeaters[index] = { ...newRepeaters[index], [field]: value };
      }
      return {
        ...prev,
        repeaters: newRepeaters,
      };
    });
  }, []);

  const removeRepeater = useCallback((id: string) => {
    setNet(prev => ({
      ...prev,
      repeaters: (prev.repeaters || []).filter(r => r.id !== id),
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!net.name || !net.primary_nco || !net.primary_nco_callsign) {
        alert("Net Name, Primary NCO Name, and Primary NCO Callsign are required.");
        return;
    }
    
    if(net.net_config_type === NetConfigType.GROUP) {
      if(!net.frequency || !net.band || !net.mode) {
        alert('Frequency, Band, and Mode are required for Group/Simplex nets.');
        return;
      }
    } else { // Repeater-based nets
      if (!net.repeaters || net.repeaters.length === 0) {
        alert('At least one repeater configuration is required.');
        return;
      }
      for (const repeater of net.repeaters) {
          if (!repeater.frequency) {
              alert('Frequency is required for all repeaters.');
              return;
          }
          if (net.net_config_type === NetConfigType.LINKED_REPEATER && !repeater.name) {
              alert('Name is required for all repeaters in a linked system.');
              return;
          }
      }
    }
    onSave(net);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">{initialNet ? 'Edit NET' : 'Create New NET'}</h1>
      <form onSubmit={handleSubmit} className="bg-dark-800 p-6 sm:p-8 rounded-lg shadow-xl space-y-8">
        
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="NET Name" id="name" name="name" type="text" value={net.name || ''} onChange={handleInputChange} required className="md:col-span-2"/>
            </div>
             <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-dark-text-secondary mb-1">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  value={net.description || ''}
                  onChange={handleInputChange}
                  placeholder="A short summary of what this NET is about."
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FormInput label="Website URL (Optional)" id="website_url" name="website_url" type="url" value={net.website_url || ''} onChange={handleInputChange} placeholder="https://example.com"/>
                <FormSelect label="Type of NET" id="net_type" name="net_type" value={net.net_type} onChange={handleInputChange}>
                    {NET_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </FormSelect>
                <FormInput label="Primary NCO Name" id="primary_nco" name="primary_nco" type="text" value={net.primary_nco || ''} onChange={handleInputChange} required />
                <FormInput label="Primary NCO Callsign" id="primary_nco_callsign" name="primary_nco_callsign" type="text" value={net.primary_nco_callsign || ''} onChange={handleInputChange} required />
                <FormInput label="Backup NCO Name" id="backup_nco" name="backup_nco" type="text" value={net.backup_nco || ''} onChange={handleInputChange} />
                <FormInput label="Backup NCO Callsign" id="backup_nco_callsign" name="backup_nco_callsign" type="text" value={net.backup_nco_callsign || ''} onChange={handleInputChange} />
            </div>
        </div>

        <fieldset className="border-t border-dark-700 pt-6">
            <legend className="text-lg font-medium text-dark-text">Default Schedule</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <FormSelect label="Day of Week" id="schedule" name="schedule" value={net.schedule} onChange={handleInputChange}>
                    {DAY_OF_WEEK_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </FormSelect>
                <FormInput label="Time" id="time" name="time" type="time" value={net.time || ''} onChange={handleInputChange} required />
                <FormSelect label="Time Zone" id="time_zone" name="time_zone" value={net.time_zone} onChange={handleInputChange}>
                    {TIME_ZONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </FormSelect>
            </div>
        </fieldset>
        
        <fieldset className="border-t border-dark-700 pt-6">
            <legend className="text-lg font-medium text-dark-text mb-4">Technical Configuration</legend>
            <FormSelect label="Configuration Type" id="net_config_type" name="net_config_type" value={net.net_config_type} onChange={handleInputChange} className="max-w-sm mb-6">
                {NET_CONFIG_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{NET_CONFIG_TYPE_LABELS[opt]}</option>)}
            </FormSelect>

            {net.net_config_type === NetConfigType.GROUP && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-dark-900/50 rounded-md">
                   <FormInput label="Frequency (MHz)" id="frequency" name="frequency" type="text" value={net.frequency || ''} onChange={handleInputChange} placeholder="e.g., 7.200" required />
                   <FormInput label="Band" id="band" name="band" type="text" value={net.band || ''} onChange={handleInputChange} placeholder="e.g., 40m" required />
                   <FormInput label="Mode" id="mode" name="mode" type="text" value={net.mode || ''} onChange={handleInputChange} placeholder="e.g., SSB" required />
                </div>
            )}

            {(net.net_config_type === NetConfigType.SINGLE_REPEATER) && net.repeaters && net.repeaters.length > 0 && (
                 <RepeaterInputSet
                    repeater={net.repeaters[0]}
                    index={0}
                    configType={net.net_config_type}
                    repeaterCount={net.repeaters.length}
                    onUpdate={updateRepeater}
                    onRemove={removeRepeater}
                 />
            )}

            {net.net_config_type === NetConfigType.LINKED_REPEATER && (
                <div className="space-y-4">
                    {net.repeaters && net.repeaters.map((repeater, index) => (
                        <RepeaterInputSet
                            key={repeater.id}
                            repeater={repeater}
                            index={index}
                            configType={net.net_config_type!}
                            repeaterCount={net.repeaters?.length || 0}
                            onUpdate={updateRepeater}
                            onRemove={removeRepeater}
                        />
                    ))}
                    <button type="button" onClick={addRepeater} className="flex items-center gap-2 text-sm font-medium text-brand-accent hover:text-yellow-400 transition-colors">
                        <Icon className="text-xl">add</Icon>
                        <span>Add Repeater</span>
                    </button>
                </div>
            )}
        </fieldset>

        <div className="flex justify-end gap-4 pt-4 border-t border-dark-700">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 text-sm font-semibold text-dark-text bg-dark-700 rounded-lg hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-dark-600 focus:ring-offset-2 focus:ring-offset-dark-800">
                Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-dark-800">
                {initialNet ? 'Save Changes' : 'Create NET'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default NetEditorScreen;
