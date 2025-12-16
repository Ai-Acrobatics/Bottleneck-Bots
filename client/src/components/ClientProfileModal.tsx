import React, { useState, useEffect } from 'react';
import { ClientContext, SeoConfig, Asset } from '../types';
import { InlineEdit } from './ui/InlineEdit';
import { Badge } from './ui/badge';
import { Kbd } from './ui/kbd';

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
  const [useInlineEdit, setUseInlineEdit] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
    setValidationErrors({});
  }, [existingProfile, isOpen]);

  // Keyboard shortcut: Cmd/Ctrl+S to save
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(e as any);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, formData, isSaving]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Client name is required';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = 'Please enter a valid URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to save client profile. Please try again.';
      setValidationErrors({ general: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInlineEditSave = async (field: keyof typeof formData, value: string): Promise<void> => {
    setFormData({ ...formData, [field]: value });

    // Validate the specific field
    if (field === 'name' && !value.trim()) {
      throw new Error('Client name is required');
    }

    if (field === 'website' && value && !isValidUrl(value)) {
      throw new Error('Please enter a valid URL');
    }

    // Clear the error for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {existingProfile ? 'Edit Client Profile' : 'New Client Profile'}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Press <Kbd>⌘</Kbd> <Kbd>S</Kbd> to save
              </p>
              {existingProfile && (
                <button
                  type="button"
                  onClick={() => setUseInlineEdit(!useInlineEdit)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {useInlineEdit ? 'Use standard inputs' : 'Enable inline editing'}
                </button>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* General Error */}
          {validationErrors.general && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{validationErrors.general}</p>
            </div>
          )}

          {/* Client Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Client Name <span className="text-red-500">*</span>
            </label>
            {useInlineEdit && existingProfile ? (
              <InlineEdit
                value={formData.name}
                onSave={(value) => handleInlineEditSave('name', value)}
                placeholder="e.g., Acme Corporation"
                validate={(value) => value.trim() ? null : 'Client name is required'}
                className="w-full"
              />
            ) : (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Acme Corporation"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            )}
            {validationErrors.name && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Subaccount Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              GHL Subaccount Name
            </label>
            <input
              type="text"
              value={formData.subaccountName}
              onChange={(e) => setFormData({ ...formData, subaccountName: e.target.value })}
              placeholder="e.g., Acme - Main Account"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Subaccount ID */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              GHL Subaccount ID
            </label>
            <input
              type="text"
              value={formData.subaccountId}
              onChange={(e) => setFormData({ ...formData, subaccountId: e.target.value })}
              placeholder="e.g., abc123xyz"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {validationErrors.website && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.website}</p>
            )}
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Brand Voice
            </label>
            <input
              type="text"
              value={formData.brandVoice}
              onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
              placeholder="e.g., Professional, Empathetic, Friendly"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Describe the tone and style of communication for this client
            </p>
          </div>

          {/* Primary Goal */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Primary Goal
            </label>
            <textarea
              value={formData.primaryGoal}
              onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
              placeholder="e.g., Increase lead conversion rate by 30%"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              What is the main business objective for this client?
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              existingProfile ? 'Update Profile' : 'Create Profile'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
