const Sidebar = ({ selectedStartup, onSelectStartup }) => {
  const startups = [
    {
      id: 'NOVAGATE',
      name: 'NovaGate',
      description: 'Event Registration Platform',
      icon: '🎯'
    },
    {
      id: 'NOVATIX',
      name: 'NovaTix',
      description: 'Concert Ticketing Platform',
      icon: '🎫'
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Startups</h2>
      </div>
      <div className="sidebar-content">
        {startups.map((startup) => (
          <button
            key={startup.id}
            className={`sidebar-item ${selectedStartup === startup.id ? 'active' : ''}`}
            onClick={() => onSelectStartup(startup.id)}
          >
            <div className="sidebar-item-icon">{startup.icon}</div>
            <div className="sidebar-item-content">
              <h3>{startup.name}</h3>
              <p>{startup.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
