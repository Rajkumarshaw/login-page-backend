import React from 'react';
import { Users, BarChart3, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const cardData = [
    {
      title: 'Total Records',
      value: stats?.total ?? 0,
      description: 'Submitted user calculations',
      icon: Users,
      color: 'text-primary-600 bg-primary-50 border-primary-100',
    },
    {
      title: 'Average Age',
      value: stats?.averageAge ? `${stats.averageAge} yrs` : 'N/A',
      description: 'Mean age of all submissions',
      icon: BarChart3,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Youngest User',
      value: stats?.youngest ? `${stats.youngest.age.years} yrs` : 'N/A',
      description: stats?.youngest ? `Name: ${stats.youngest.name}` : 'No records yet',
      icon: ArrowDownCircle,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Oldest User',
      value: stats?.oldest ? `${stats.oldest.age.years} yrs` : 'N/A',
      description: stats?.oldest ? `Name: ${stats.oldest.name}` : 'No records yet',
      icon: ArrowUpCircle,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.title}</span>
              <div className="text-3xl font-extrabold text-gray-900">{card.value}</div>
              <p className="text-xs text-gray-500 font-medium truncate max-w-[170px]" title={card.description}>
                {card.description}
              </p>
            </div>
            <div className={`p-3 rounded-xl border ${card.color}`}>
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
