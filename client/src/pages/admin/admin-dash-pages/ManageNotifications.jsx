import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../../../lib/api';


const ManageNotifications = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [targets, setTargets] = useState('');
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/v1/notifications/sent').then(res => setSent(res.data.data));
  }, []);

  const handleSend = async () => {
    if (!title || !body || !targets) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#16a34a'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Send Notification?',
      html: `
        <div class="text-left">
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Body:</strong> ${body}</p>
          ${url ? `<p><strong>URL:</strong> ${url}</p>` : ''}
          <p><strong>Targets:</strong> ${targets}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, send it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const targetArray = targets === 'all' ? 'all' : targets.split(',').map(t => t.trim());
        await api.post('/api/v1/notifications/custom', { 
          title, 
          body, 
          url: url || null,
          targets: targetArray 
        });
        
        // Refresh sent
        const res = await api.get('/api/v1/notifications/sent');
        setSent(res.data.data);
        
        // Clear form
        setTitle('');
        setBody('');
        setUrl('');
        setTargets('');
        
        Swal.fire({
          icon: 'success',
          title: 'Notification Sent!',
          text: 'Your notification has been sent successfully',
          confirmButtonColor: '#16a34a'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Send',
          text: 'Something went wrong. Please try again.',
          confirmButtonColor: '#16a34a'
        });
        console.log(error)
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8">Manage Notifications</h2>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Send Custom Notification</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter notification title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Enter notification message"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Enter URL (e.g., https://example.com)"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Targets <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter 'all' or comma-separated emails/ids"
                value={targets}
                onChange={e => setTargets(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use "all" for everyone or separate multiple targets with commas
              </p>
            </div>

            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Past Sent Notifications</h3>
          
          {sent.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No notifications sent yet</p>
          ) : (
            <div className="space-y-3">
              {sent.map(n => (
                <div key={n.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition">
                  <h4 className="font-semibold text-gray-800 mb-1">{n.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{n.body}</p>
                  {n.url && (
                    <p className="text-xs text-blue-600 mb-2">
                      <span className="text-gray-500">URL:</span> {n.url}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>
                      <span className="font-medium">Targets:</span> {n.targets}
                    </span>
                    <span>
                      <span className="font-medium">Sent:</span> {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageNotifications;