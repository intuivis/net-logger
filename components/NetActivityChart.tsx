import React, { useMemo } from 'react';
import { NetSession, CheckIn } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface NetActivityChartProps {
  sessions: NetSession[];
  checkIns: CheckIn[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-900/80 backdrop-blur-sm p-3 border border-dark-700 rounded-lg shadow-lg">
        <p className="text-sm font-bold text-dark-text-secondary">{`${label}`}</p>
        <p className="text-brand-accent font-semibold">{`Check-ins: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export const NetActivityChart: React.FC<NetActivityChartProps> = ({ sessions, checkIns }) => {
  const chartData = useMemo(() => {
    if (sessions.length === 0) {
      return [];
    }
    
    const data = sessions
      .map(session => {
        const sessionCheckIns = checkIns.filter(ci => ci.session_id === session.id).length;
        return {
          date: new Date(session.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          'Check-ins': sessionCheckIns,
          fullDate: new Date(session.start_time)
        };
      })
      .filter(d => d['Check-ins'] > 0) // Only show sessions with activity
      .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime()); // Sort chronologically

    return data;
  }, [sessions, checkIns]);

  // Don't render a chart if there's not enough data to form a line
  if (chartData.length < 2) {
    return null;
  }

  return (
    <div className="bg-dark-800 shadow-lg rounded-lg p-5 sm:p-6">
       <h3 className="text-xl font-bold text-dark-text mb-6">Check-In Actvity</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
            <LineChart
                data={chartData}
                margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="date" stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 193, 7, 0.1)' }}/>
                <Legend wrapperStyle={{fontSize: "14px", paddingTop: "20px"}}/>
                <Line
                    type="monotone"
                    dataKey="Check-ins"
                    stroke="#FFC107"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#FFC107' }}
                    activeDot={{ r: 6, stroke: '#121212', strokeWidth: 2, fill: '#FFC107' }}
                />
            </LineChart>
            </ResponsiveContainer>
      </div>
    </div>
  );
};
