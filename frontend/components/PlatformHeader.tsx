export default function PlatformHeader() {
  return (
    <div className="w-full">
      <div className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">Policy Q&amp;A</h1>
        <div className="flex items-center space-x-6">
          {/* Navigation Links */}
          <nav className="flex items-center space-x-4 text-sm">
            <a href="#" className="hover:underline hover:text-blue-200 transition-colors">Dashboard</a>
            <a href="#" className="hover:underline hover:text-blue-200 transition-colors">Policy Library</a>
            <a href="#" className="hover:underline hover:text-blue-200 transition-colors">Analytics</a>
            <a href="#" className="hover:underline hover:text-blue-200 transition-colors">Reports</a>
            <a href="#" className="hover:underline hover:text-blue-200 transition-colors">Settings</a>
          </nav>
          
          {/* Account Section */}
          <div className="flex items-center space-x-2 text-sm border-l border-blue-500 pl-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-semibold">
              U
            </div>
            <a href="#" className="hover:underline hover:text-blue-200 transition-colors">Account</a>
          </div>
        </div>
      </div>
      <div className="h-1 bg-green-500"></div>
    </div>
  );
}
