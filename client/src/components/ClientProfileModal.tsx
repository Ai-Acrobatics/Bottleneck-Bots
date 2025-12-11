import React, { useState, useEffect } from 'react';
import { ClientContext, SeoConfig, Asset } from '../types';

interface ClientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Omit<ClientContext, 'id' | 'source'>) => Promise<void>;
  existingProfile?: ClientContext | null;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingProfile,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subaccountName: '',
    subaccountId: '',
    brandVoice: '',
    primaryGoal: '',
    website: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingProfile) {
      setFormData({
        name: existingProfile.name || '',
        subaccountName: existingProfile.subaccountName || '',
        subaccountId: existingProfile.subaccountId || '',
        brandVoice: existingProfile.brandVoice || '',
        primaryGoal: existingProfile.primaryGoal || '',
        website: existingProfile.website || '',
      });
    } else {
      // Reset form for new profile
      setFormData({
        name: '',
        subaccountName: '',
        subaccountId: '',
        brandVoice: '',
        primaryGoal: '',
        website: '',
      });
    }
  }, [existingProfile, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Client name is required');
      return;
    }

    setIsSaving(true);

    try {
      const profileData: Omit<ClientContext, 'id' | 'source'> = {
        name: formData.name,
        subaccountName: formData.subaccountName || '',
        subaccountId: formData.subaccountId || '',
        brandVoice: formData.brandVoice || '',
        primaryGoal: formData.primaryGoal || '',
        website: formData.website || '',
        seo: existingProfile?.seo || { siteTitle: '', metaDescription: '', keywords: [], robotsTxt: '' },
        assets: existingProfile?.assets || [],
      };

      await onSave(profileData);
      onClose();
    } catch (error) {
      console.error('Failed to save client profile:', error);
      alert('Failed to save client profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">
            {existingProfile ? 'Edit Client Profile' : 'New Client Profile'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Acme Corporation"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Subaccount Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              GHL Subaccount Name
            </label>
            <input
              type="text"
              value={formData.subaccountName}
              onChange={(e) => setFormData({ ...formData, subaccountName: e.target.value })}
              placeholder="e.g., Acme - Main Account"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Subaccount ID */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              GHL Subaccount ID
            </label>
            <input
              type="text"
              value={formData.subaccountId}
              onChange={(e) => setFormData({ ...formData, subaccountId: e.target.value })}
              placeholder="e.g., abc123xyz"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Brand Voice
            </label>
            <input
              type="text"
              value={formData.brandVoice}
              onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
              placeholder="e.g., Professional, Empathetic, Friendly"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              Describe the tone and style of communication for this client
            </p>
          </div>

          {/* Primary Goal */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Primary Goal
            </label>
            <textarea
              value={formData.primaryGoal}
              onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
              placeholder="e.g., Increase lead conversion rate by 30%"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              What is the main business objective for this client?
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};
