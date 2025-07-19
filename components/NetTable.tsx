import React from 'react';
import { Net, NET_CONFIG_TYPE_LABELS } from '../types';
import { formatTime, formatTimeZone } from '../lib/time';
import { NetTypeBadge } from './NetTypeBadge';

interface NetTableProps {
    nets: Net[];
    activeSessionNetIds: Set<string>;
    onViewDetails: (netId: string) => void;
}

export const NetTable: React.FC<NetTableProps> = ({ nets, activeSessionNetIds, onViewDetails }) => {
  return (
    <div className="bg-dark-800 shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-700">
                <thead className="bg-dark-700/50">
                    <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">NET Name</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Configuration</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Schedule</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Primary NCO</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                    {nets.map(net => {
                        const isActive = activeSessionNetIds.has(net.id);
                        return (
                            <tr key={net.id} className="hover:bg-dark-700/30 group cursor-pointer" onClick={() => onViewDetails(net.id)}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {isActive ? (
                                        <div className="flex items-center gap-2">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                            </span>
                                            <span className="text-sm font-semibold text-green-400">Active</span>
                                        </div>
                                    ) : (
                                         <div className="flex items-center gap-2">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-dark-600"></span>
                                            </span>
                                            <span className="text-sm text-dark-text-secondary">Idle</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-dark-text">{net.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary"><NetTypeBadge type={net.net_type} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{NET_CONFIG_TYPE_LABELS[net.net_config_type] || net.net_config_type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{net.schedule} at {formatTime(net.time)} {formatTimeZone(net.time_zone)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{net.primary_nco} ({net.primary_nco_callsign})</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );
};