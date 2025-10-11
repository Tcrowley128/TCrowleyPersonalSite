'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Check, Trash2, MessageSquare, Calendar, X, FileText } from 'lucide-react';
import { emailTemplates, fillTemplate } from '@/lib/emailTemplates';
import AdminLayout from '@/components/AdminLayout';

type ContactStatus = 'NEW' | 'READ' | 'RESPONDED' | 'SPAM' | 'ARCHIVED';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'NEW' | 'READ' | 'RESPONDED' | 'SPAM' | 'ARCHIVED';
  responded: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [replyForm, setReplyForm] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/contact');
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission);

    // Mark as read if it's new
    if (submission.status === 'NEW') {
      await updateStatus(submission.id, 'READ');
    }
  };

  const handleReply = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setReplyForm({
      subject: `Re: ${submission.subject || 'Your message'}`,
      message: `Hi ${submission.name},\n\nThank you for reaching out!\n\n`,
    });
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!selectedSubmission) return;

    try {
      const response = await fetch('/api/contact/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          to: selectedSubmission.email,
          subject: replyForm.subject,
          message: replyForm.message,
        }),
      });

      if (response.ok) {
        alert('Reply sent successfully!');
        await updateStatus(selectedSubmission.id, 'RESPONDED', true);
        setShowReplyModal(false);
        setReplyForm({ subject: '', message: '' });
      } else {
        const error = await response.json();
        alert(`Failed to send reply: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply');
    }
  };

  const updateStatus = async (id: string, status: string, responded?: boolean) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status, responded }),
      });

      if (response.ok) {
        await fetchSubmissions();
        if (selectedSubmission?.id === id) {
          setSelectedSubmission({ ...selectedSubmission, status: status as ContactStatus, responded: responded || selectedSubmission.responded });
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    await updateStatus(id, 'ARCHIVED');
    setSelectedSubmission(null);
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filterStatus === 'all') return s.status !== 'ARCHIVED';
    return s.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'READ': return 'bg-yellow-100 text-yellow-800';
      case 'RESPONDED': return 'bg-green-100 text-green-800';
      case 'SPAM': return 'bg-red-100 text-red-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Submissions</h1>
          <p className="text-gray-600">Manage and respond to contact form submissions</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'NEW', label: 'New' },
            { key: 'READ', label: 'Read' },
            { key: 'RESPONDED', label: 'Responded' },
            { key: 'SPAM', label: 'Spam' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter.label}
              {filter.key !== 'all' && (
                <span className="ml-2 text-xs">
                  ({submissions.filter(s => s.status === filter.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                Submissions ({filteredSubmissions.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No submissions found</p>
                </div>
              ) : (
                filteredSubmissions.map((submission) => (
                  <motion.div
                    key={submission.id}
                    onClick={() => handleViewSubmission(submission)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedSubmission?.id === submission.id ? 'bg-blue-50' : ''
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{submission.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{submission.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    {submission.subject && (
                      <p className="text-sm text-gray-700 mb-1 font-medium">{submission.subject}</p>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{submission.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(submission.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Submission Detail */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedSubmission.name}</h2>
                      <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(selectedSubmission.status)}`}>
                        {selectedSubmission.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Mail size={16} />
                      <a href={`mailto:${selectedSubmission.email}`} className="hover:text-blue-600">
                        {selectedSubmission.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar size={14} />
                      {new Date(selectedSubmission.createdAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                </div>

                {selectedSubmission.subject && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Subject</h3>
                    <p className="text-lg text-gray-900">{selectedSubmission.subject}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Message</h3>
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
                    {selectedSubmission.message}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleReply(selectedSubmission)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Send size={18} />
                    Reply
                  </button>

                  {selectedSubmission.status !== 'RESPONDED' && (
                    <button
                      onClick={() => updateStatus(selectedSubmission.id, 'RESPONDED', true)}
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <Check size={18} />
                      Mark as Responded
                    </button>
                  )}

                  <button
                    onClick={() => updateStatus(selectedSubmission.id, 'SPAM')}
                    className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    <X size={18} />
                    Mark as Spam
                  </button>

                  <button
                    onClick={() => handleDelete(selectedSubmission.id)}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                    Archive
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No submission selected</h3>
                <p className="text-gray-600">Select a submission from the list to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Reply Modal */}
        {showReplyModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Reply to {selectedSubmission.name}</h2>
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">To: {selectedSubmission.email}</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Template Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText size={16} className="inline mr-1" />
                    Use Template (Optional)
                  </label>
                  <select
                    onChange={(e) => {
                      const template = emailTemplates.find(t => t.id === e.target.value);
                      if (template) {
                        const filled = fillTemplate(template, {
                          name: selectedSubmission.name,
                          subject: selectedSubmission.subject,
                        });
                        setReplyForm({
                          subject: filled.subject,
                          message: filled.message,
                        });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                  >
                    <option value="">Select a template...</option>
                    {emailTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={replyForm.subject}
                    onChange={(e) => setReplyForm({ ...replyForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={replyForm.message}
                    onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This will simulate sending an email. In production, integrate with an email service like SendGrid, Resend, or Nodemailer.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendReply}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Send Reply
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      </div>
    </AdminLayout>
  );
}
