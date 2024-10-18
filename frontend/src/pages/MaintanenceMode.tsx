import { AlertTriangle } from 'lucide-react';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">We're Down for Maintenance</h1>
        <p className="text-gray-600 mb-6">
          We're currently performing some routine maintenance on our site. We'll be back up and running as soon as possible. Thank you for your patience!
        </p>
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Expected downtime: <span className="font-semibold">2 hours</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            For urgent inquiries, please contact Telegram : @de0saju
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;