'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface Scores {
  trust: number;
  growth: number;
  quality: number;
  overall: number;
}

interface CompanyRadarChartProps {
  scores: Scores;
}

export default function CompanyRadarChart({ scores }: CompanyRadarChartProps) {
  const radarData = [
    { subject: 'Trust', score: scores.trust, fullMark: 100 },
    { subject: 'Growth', score: scores.growth, fullMark: 100 },
    { subject: 'Quality', score: scores.quality, fullMark: 100 },
    { subject: 'Overall', score: scores.overall, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid 
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeWidth={1}
            strokeOpacity={0.5}
          />
          <PolarAngleAxis 
            dataKey="subject"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 14, fontWeight: 500 }}
          />
          <Radar
            name="Company Scores"
            dataKey="score"
            className="fill-blue-500/60 stroke-blue-500"
            strokeWidth={2}
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}