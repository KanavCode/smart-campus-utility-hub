import { useState } from 'react';
import { toast } from 'sonner';
import { Bug, X, Send } from 'lucide-react';
import api from '@/lib/axios';

export const BugReportWidget = () => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setIsSubmitting(true);
      await api.post('/feedback', {
        description: description.trim(),
        page: window.location.pathname,
      });
      toast.success('Bug report sent! Thanks for helping us improve. 🐛');
      setDescription('');
      setOpen(false);
    } catch {
      toast.error('Failed to send bug report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Report a bug"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center transition-colors"
      >
        <Bug size={20} />
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-background border rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Bug size={16} className="text-red-500" />
                Report a Bug
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what went wrong..."
                rows={4}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/500
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim() || description.length > 500}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-md py-2 text-sm font-medium transition-colors"
              >
                <Send size={14} />
                {isSubmitting ? 'Sending...' : 'Send Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
