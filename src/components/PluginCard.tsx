import React from 'react';

interface PluginSummary {
  id: string;
  name: string;
  description: string;
}

interface PluginCardProps {
  plugin: PluginSummary;
  onClick: (id: string) => void;
}

const PluginCard: React.FC<PluginCardProps> = ({ plugin, onClick }) => {
  return (
    <div className="border p-4 rounded-lg hover:shadow-lg" onClick={() => onClick(plugin.id)}>
      <h2 className="font-bold">{plugin.name}</h2>
      <p>{plugin.description}</p>
    </div>
  );
};

export default PluginCard;