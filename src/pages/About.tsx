import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';


interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const About = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message,
          },
        ]);

      if (error) {
        console.error('Error submitting form:', error);
        setSubmitStatus('error');
        return;
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* About Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('About Us')}</h1>
        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            {t('Welcome to Mamata Nepal, a platform dedicated to fostering meaningful discussions and connections within mothers and their caregivers. Our mission is to create a safe and inclusive space where people can share their thoughts, experiences, and ideas on all maternity related topics.')}
          </p>
          <p className="text-gray-700">
            {t('We believe in the power of open dialogue and the importance of building strong community bonds. Whether you\'re here to share your story, seek advice, or engage in thoughtful discussions, we\'re here to support you every step of the way.')}
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('Contact Us')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('Name')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('Email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              {t('Message')}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          {submitStatus === 'success' && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg">
              {t('Thank you for your message! We\'ll get back to you soon.')}
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              {t('Sorry, there was an error sending your message. Please try again.')}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? t('Sending...') : t('Send Message')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default About; 