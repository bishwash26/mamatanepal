import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface CreateShortProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateShort({ onClose, onSuccess }: CreateShortProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [authorCredit, setAuthorCredit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeId.trim()) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert(t('Please login to add a short'));
        return;
      }

      const { error } = await supabase
        .from('shorts')
        .insert([
          {
            title: title.trim(),
            youtube_id: youtubeId.trim(),
            author_id: user.id,
            author_credit: authorCredit.trim() || null
          },
        ]);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating short:', error);
      alert(t('Failed to add short. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('Add New Short')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Title')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('YouTube Short ID')}
            </label>
            <input
              type="text"
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Author Credit')}
            </label>
            <input
              type="text"
              value={authorCredit}
              onChange={(e) => setAuthorCredit(e.target.value)}
              placeholder={t('Enter original content creator name (optional)')}
              className="w-full p-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-700"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? t('Adding...') : t('Add Short')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 