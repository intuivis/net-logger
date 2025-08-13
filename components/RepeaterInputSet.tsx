// components/RepeaterInputSet.tsx
import React from 'react';
import { Repeater, NetConfigType } from '../types';
import FormInput from './FormInput';
import { Icon } from './Icon';

/**
 * @interface RepeaterInputSetProps
 * @description Props for the RepeaterInputSet component.
 */
interface RepeaterInputSetProps {
  /** The repeater data object to display and edit. */
  repeater: Repeater;
  /** The index of this repeater in the list, used for targeting updates. */
  index: number;
  /** The current net configuration type. */
  configType: NetConfigType;
  /** The total number of repeaters being configured. */
  repeaterCount: number;
  /** Callback to update a specific field of the repeater. */
  onUpdate: (index: number, field: keyof Omit<Repeater, 'id'>, value: string) => void;
  /** Callback to remove this repeater from the list. */
  onRemove: (id: string) => void;
}

/**
 * @component RepeaterInputSet
 * @description A set of form inputs for configuring a single amateur radio repeater.
 * This component is used within the NetEditorScreen for both single and linked repeater configurations.
 */
const RepeaterInputSet: React.FC<RepeaterInputSetProps> = ({
  repeater,
  index,
  configType,
  repeaterCount,
  onUpdate,
  onRemove
}) => {
    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof Omit<Repeater, 'id'>, value: string };
        onUpdate(index, name, value);
    };

    return (
        <div className="p-4 bg-dark-900/50 rounded-lg border border-dark-700 space-y-4">
            {configType === NetConfigType.LINKED_REPEATER && (
                <div className="flex justify-between items-center">
                    <h4 className="text-md font-medium text-dark-text">Repeater #{index + 1}</h4>
                    {repeaterCount > 1 && (
                         <button
                            type="button"
                            onClick={() => onRemove(repeater.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors"
                            aria-label="Remove Repeater"
                        >
                            <Icon className="text-xl">delete</Icon>
                        </button>
                    )}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Name"
                    id={`repeater-name-${repeater.id}`}
                    name="name"
                    value={repeater.name || ''}
                    onChange={handleUpdate}
                    placeholder="e.g., K4GSO 2m Repeater"
                    required
                />
                <FormInput
                    label="Owner Callsign (Optional)"
                    id={`repeater-owner-${repeater.id}`}
                    name="owner_callsign"
                    value={repeater.owner_callsign || ''}
                    onChange={handleUpdate}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormInput
                    label="Downlink Freq (MHz)"
                    id={`repeater-downlink-${repeater.id}`}
                    name="downlink_freq"
                    value={repeater.downlink_freq || ''}
                    onChange={handleUpdate}
                    placeholder="e.g., 146.790"
                    required
                />
                 <FormInput
                    label="Offset (MHz)"
                    id={`repeater-offset-${repeater.id}`}
                    name="offset"
                    value={repeater.offset || ''}
                    onChange={handleUpdate}
                    placeholder="e.g., -0.600"
                />
                <FormInput
                    label="Uplink Tone (Hz)"
                    id={`repeater-uplink-tone-${repeater.id}`}
                    name="uplink_tone"
                    value={repeater.uplink_tone || ''}
                    onChange={handleUpdate}
                    placeholder="e.g., 131.8"
                />
                 <FormInput
                    label="Downlink Tone (Hz)"
                    id={`repeater-downlink-tone-${repeater.id}`}
                    name="downlink_tone"
                    value={repeater.downlink_tone || ''}
                    onChange={handleUpdate}
                    placeholder="e.g., 131.8"
                />
            </div>
        </div>
    );
};

export default RepeaterInputSet;
