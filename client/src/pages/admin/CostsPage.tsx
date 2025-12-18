import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CostDashboard } from '@/components/dashboard/CostDashboard';

export const CostsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Cost Analytics</h2>
          <p className="text-slate-400 mt-1">Monitor API usage and spending across all services</p>
        </div>
        <CostDashboard />
      </div>
    </AdminLayout>
  );
};

export default CostsPage;
