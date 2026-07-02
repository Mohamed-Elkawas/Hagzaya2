import { Outlet } from 'react-router-dom';
import { OwnerSidebar } from './OwnerSidebar';

export function OwnerLayout() {
  return (
    // We let the LanguageProvider manage the `dir` and font classes at the document level.
    // We wrap everything in a flex row to naturally place the sidebar and content.
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Shared Sidebar across all Owner routes */}
      <OwnerSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
