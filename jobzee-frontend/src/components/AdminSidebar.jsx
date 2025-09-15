import React from 'react';

const AdminSidebar = ({ activeTab, onTabChange, onLogout, admin, isMobile = false, open = false, onClose }) => {
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'employers', name: 'Employers', icon: '🏢' },
    { id: 'jobs', name: 'Jobs', icon: '💼' },
    { id: 'queries', name: 'Queries', icon: '✉️' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <aside className="bg-white border-r w-64 min-h-screen hidden md:flex md:flex-col">
        <div className="px-4 py-5 border-b">
          <div className="text-xl font-bold">JobZee Admin</div>
          <div className="text-sm text-gray-600 mt-1 truncate">{admin?.name || 'Administrator'}</div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={onLogout} className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Logout</button>
        </div>
      </aside>
    );
  }

  // Mobile Drawer Sidebar
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <aside className="relative bg-white w-72 h-full shadow-xl flex flex-col">
        <div className="px-4 py-4 border-b flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">JobZee Admin</div>
            <div className="text-xs text-gray-600 mt-0.5 truncate">{admin?.name || 'Administrator'}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { onTabChange(tab.id); onClose && onClose(); }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={() => { onLogout(); onClose && onClose(); }} className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Logout</button>
        </div>
      </aside>
    </div>
  );
};

export default AdminSidebar;


