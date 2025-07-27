

import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Net, Repeater, NetType, DayOfWeek, NetConfigType, NET_CONFIG_TYPE_LABELS, PERMISSION_DEFINITIONS, PasscodePermissions, PermissionKey, Profile } from '../types';
import { NET_TYPE_OPTIONS, DAY_OF_WEEK_OPTIONS, TIME_ZONE_OPTIONS, NET_CONFIG_TYPE_OPTIONS } from '../constants';
import { Icon } from '../components/Icon';

interface NetEditorScreenProps {
  initialNet?: Net;
  onSave: (net: Partial<Net>) => void;
  onCancel: () => void;
  profile: Profile | null;
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
  onUpdate: (index: number, field: keyof Omit<Repeater, 'id'>, value: string) => void;
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
  <div className="p-4 bg-dark-900/50 rounded-lg border border-dark-700">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormInput className="md:col-span-2" label="Repeater Name" id={`r-name-${index}`} type="text" value={repeater.name} onChange={e => onUpdate(index, 'name', e.target.value)} placeholder="e.g., Spring Mountain" required />
        <FormInput className="md:col-span-2" label="Owner Callsign" id={`r-owner-${index}`} type="text" value={repeater.owner_callsign || ''} onChange={e => onUpdate(index, 'owner_callsign', e.target.value)} placeholder="e.g., K4NRC" />
        
        <FormInput label="Downlink Freq (MHz)" id={`r-freq-${index}`} type="text" value={repeater.downlink_freq} onChange={e => onUpdate(index, 'downlink_freq', e.target.value)} placeholder="e.g., 145.130" required />
        <FormInput label="Offset (MHz)" id={`r-offset-${index}`} type="text" value={repeater.offset || ''} onChange={e => onUpdate(index, 'offset', e.target.value)} placeholder="e.g., -0.600" />
        <FormInput label="Uplink Tone (Hz)" id={`r-uplink-tone-${index}`} type="text" value={repeater.uplink_tone || ''} onChange={e => onUpdate(index, 'uplink_tone', e.target.value)} placeholder="e.g., 156.7" />
        <FormInput label="Downlink Tone (Hz)" id={`r-downlink-tone-${index}`} type="text" value={repeater.downlink_tone || ''} onChange={e => onUpdate(index, 'downlink_tone', e.target.value)} placeholder="e.g., 156.7" />

        <FormInput label="County" id={`r-county-${index}`} type="text" value={repeater.county || ''} onChange={e => onUpdate(index, 'county', e.target.value)} placeholder="e.g., Coweta" />
        <FormInput label="Grid Square" id={`r-grid-${index}`} type="text" value={repeater.grid_square || ''} onChange={e => onUpdate(index, 'grid_square', e.target.value)} placeholder="e.g., EM73oj" />
        <FormInput className="md:col-span-2" label="Website URL" id={`r-website-${index}`} type="url" value={repeater.website_url || ''} onChange={e => onUpdate(index, 'website_url', e.target.value)} placeholder="https://example.com" />
    </div>
    {configType === NetConfigType.LINKED_REPEATER && repeaterCount > 1 && (
        <div className="flex justify-end mt-3">
            <button type="button" onClick={() => onRemove(repeater.id)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors">
                <Icon className="text-xl">delete</Icon>
            </button>
        </div>
    )}
  </div>
));


const NetEditorScreen: React.FC<NetEditorScreenProps> = ({ initialNet, onSave, onCancel, profile }) => {
  const [net, setNet] = useState<Partial<Net>>(() => {
    const baseNet: Partial<Net> = initialNet || {
      name: '',
      description: '',
      website_url: '',
      primary_nco: '',
      primary_nco_callsign: '',
      net_type: NetType.TECHNICAL,
      schedule: DayOfWeek.TUESDAY,
      time: '19:00',
      time_zone: 'America/New_York',
      net_config_type: NetConfigType.SINGLE_REPEATER,
      repeaters: [],
      frequency: '',
      band: '',
      mode: '',
      passcode: null,
      passcode_permissions: {},
    };
    
    // On-the-fly migration for repeaters from old format to new format
    if (baseNet.repeaters && baseNet.repeaters.length > 0) {
        baseNet.repeaters = baseNet.repeaters.map((r: any) => {
            if (r.frequency !== undefined) { // This property only existed on the old format
                const offset = r.tone_offset === 'plus' ? '+0.600' : r.tone_offset === 'minus' ? '-0.600' : null;
                return {
                    id: r.id || uuidv4(),
                    name: r.name || '',
                    owner_callsign: null,
                    grid_square: null,
                    county: null,
                    downlink_freq: r.frequency || '',
                    offset: offset,
                    uplink_tone: r.tone || null,
                    downlink_tone: r.tone || null,
                    website_url: null,
                };
            }
            return r; // Already in new format
        });
    }

    // Ensure there's always at least one repeater object for repeater-based nets
    if ((baseNet.net_config_type === NetConfigType.SINGLE_REPEATER || baseNet.net_config_type === NetConfigType.LINKED_REPEATER) && (!baseNet.repeaters || baseNet.repeaters.length === 0)) {
        baseNet.repeaters = [{ id: uuidv4(), name: '', owner_callsign: null, grid_square: null, county: null, downlink_freq: '', offset: null, uplink_tone: null, downlink_tone: null, website_url: null }];
    }

    return baseNet;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let finalValue: string | PasscodePermissions = value;

    if (name.toLowerCase().includes('callsign')) {
      finalValue = value.toUpperCase();
    }
    
    if (name === 'passcode') {
        const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]*$/;
        if (ALPHANUMERIC_REGEX.test(value) && value.length <= 8) {
            finalValue = value;
        } else {
            return; // Don't update state if invalid
        }
    }

    setNet(prev => {
        const newNet = { ...prev, [name]: finalValue };

        if (name === 'net_config_type') {
            const newConfigType = value as NetConfigType;
            
            if (newConfigType === NetConfigType.SINGLE_REPEATER) {
                if (!newNet.repeaters || newNet.repeaters.length === 0) {
                    newNet.repeaters = [{ id: uuidv4(), name: '', owner_callsign: null, grid_square: null, county: null, downlink_freq: '', offset: null, uplink_tone: null, downlink_tone: null, website_url: null }];
                } else if (newNet.repeaters.length > 1) {
                    newNet.repeaters = [newNet.repeaters[0]];
                }
            } else if (newConfigType === NetConfigType.LINKED_REPEATER) {
                if (!newNet.repeaters || newNet.repeaters.length === 0) {
                     newNet.repeaters = [{ id: uuidv4(), name: '', owner_callsign: null, grid_square: null, county: null, downlink_freq: '', offset: null, uplink_tone: null, downlink_tone: null, website_url: null }];
                }
            }
        }
        
        return newNet;
    });
  };

  const handlePermissionChange = (key: PermissionKey, checked: boolean) => {
    setNet(prev => {
        const newPermissions = { ...prev.passcode_permissions, [key]: checked };
        // Clean up false values
        if (!checked) {
            delete newPermissions[key];
        }
        return {
            ...prev,
            passcode_permissions: newPermissions
        };
    });
  };

  const addRepeater = useCallback(() => {
    setNet(prev => ({
      ...prev,
      repeaters: [...(prev.repeaters || []), { id: uuidv4(), name: '', owner_callsign: null, grid_square: null, county: null, downlink_freq: '', offset: null, uplink_tone: null, downlink_tone: null, website_url: null }],
    }));
  }, []);

  const updateRepeater = useCallback((index: number, field: keyof Omit<Repeater, 'id'>, value: string) => {
    setNet(prev => {
      if (!prev?.repeaters) return prev;

      const newRepeaters = prev.repeaters.map((r, i) => {
        if (i !== index) {
          return r;
        }
        
        const isNullable = field !== 'name' && field !== 'downlink_freq';
        let processedValue: string | null = value;

        if (field === 'owner_callsign') {
          processedValue = value.toUpperCase();
        }

        if (isNullable && processedValue === '') {
            processedValue = null;
        }
        
        return {
          ...r,
          [field]: processedValue,
        };
      });

      return { ...prev, repeaters: newRepeaters };
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
        alert("Net Name and Primary NCO fields are required.");
        return;
    }

    if (net.passcode && (net.passcode.length < 4 || net.passcode.length > 8)) {
        alert("Passcode must be between 4 and 8 alphanumeric characters.");
        return;
    }

    if (net.passcode && (!net.passcode_permissions || Object.keys(net.passcode_permissions).length === 0)) {
        alert("If you set a passcode, you must select at least one permission.");
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
          if (!repeater.downlink_freq) {
              alert('Downlink Frequency is required for all repeaters.');
              return;
          }
          if (!repeater.name) {
              alert('Name is required for all repeaters.');
              return;
          }
      }
    }
    onSave(net);
  };

  const isOwner = initialNet && profile ? initialNet.created_by === profile.id : false;
  const isAdmin = profile ? profile.role === 'admin' : false;
  // User can manage permissions if they are creating a new net, or if they are the owner/admin of an existing net.
  const canManagePermissions = !initialNet || isOwner || isAdmin;

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
        
        {canManagePermissions && (
          <fieldset className="border-t border-dark-700 pt-6">
              <legend className="text-lg font-medium text-dark-text">Delegate Permissions</legend>
              <p className="text-sm text-dark-text-secondary mt-1 mb-4">Create a passcode to allow other authenticated users permission to help manage this NET. If you set a passcode, you must select at least one permission. Leave blank to disable.</p>
              
              <div className="p-4 bg-dark-900/50 rounded-lg border border-dark-700">
                  <div className="max-w-sm">
                      <FormInput 
                          label="Passcode" 
                          id="passcode" 
                          name="passcode" 
                          type="text"
                          className="w-32"
                          value={net.passcode || ''} 
                          onChange={handleInputChange}
                          placeholder=""
                      />
                  <p className="text-xs text-dark-text-secondary mt-1">4-8 alphanumeric characters</p>
                  </div>

                  {net.passcode && (
                      <div className="mt-6">
                          <h4 className="text-md font-medium text-dark-text-secondary mb-2">Permissions</h4>
                          <div className="space-y-4">
                            {PERMISSION_DEFINITIONS.map(p => (
                                <div key={p.key} className="relative flex items-start">
                                      <div className="flex h-6 items-center">
                                          <input
                                              id={`perm-${p.key}`}
                                              name={`perm-${p.key}`}
                                              type="checkbox"
                                              className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-accent"
                                              checked={net.passcode_permissions?.[p.key] || false}
                                              onChange={(e) => handlePermissionChange(p.key, e.target.checked)}
                                          />
                                      </div>
                                      <div className="ml-3 text-sm leading-6">
                                          <label htmlFor={`perm-${p.key}`} className="font-medium text-dark-text">{p.label}</label>
                                          <p className="text-dark-text-secondary">{p.description}</p>
                                      </div>
                                  </div>
                            ))}
                          </div>
                      </div>
                  )}
              </div>
          </fieldset>
        )}

        <div className="flex justify-end gap-4 pt-4 border-t border-dark-700">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 text-sm font-semibold text-dark-text bg-dark-700 rounded-lg hover:bg-dark-600">Cancel</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary">
                {initialNet ? 'Save Changes' : 'Create NET'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default NetEditorScreen;