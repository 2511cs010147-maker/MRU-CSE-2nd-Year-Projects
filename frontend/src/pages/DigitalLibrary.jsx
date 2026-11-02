import React, { useState, useEffect } from 'react';
import { libraryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DigitalLibrary = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Add Resource Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    author: '',
    category: 'Book',
    subject: '',
    fileType: 'PDF',
    resourceUrl: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = ['ALL', 'Book', 'Notes', 'PDF', 'Study Material'];

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await libraryAPI.search(
        searchQuery,
        selectedCategory === 'ALL' ? '' : selectedCategory
      );
      setResources(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Failed to load library resources.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!resourceForm.title) {
      setMessage({ type: 'warning', text: 'Title is required.' });
      return;
    }

    setSubmitting(true);
    try {
      await libraryAPI.addResource({
        ...resourceForm,
        uploadedBy: user?.fullName || user?.username || 'Faculty Member',
      });
      setMessage({ type: 'success', text: `Resource "${resourceForm.title}" added to library!` });
      setShowAddModal(false);
      setResourceForm({
        title: '',
        author: '',
        category: 'Book',
        subject: '',
        fileType: 'PDF',
        resourceUrl: '',
        description: '',
      });
      fetchResources();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Failed to add library resource.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await libraryAPI.deleteResource(id);
      setMessage({ type: 'success', text: `Resource "${title}" removed.` });
      fetchResources();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Failed to delete resource.' });
    }
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'book': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'notes': return 'bg-success-subtle text-success border border-success-subtle';
      case 'pdf': return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'study material': return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      default: return 'bg-light text-dark border';
    }
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span className="badge bg-info-subtle text-info border border-info-subtle px-3 py-1 mb-1 rounded-pill">
            <i className="bi bi-book-half me-1"></i> Academic Knowledge Base
          </span>
          <h2 className="fw-bold text-dark mb-0">Digital Academic Library</h2>
          <p className="text-muted small mb-0">
            Access textbooks, lecture notes, question banks, and research guides.
          </p>
        </div>

        {canManage && (
          <button className="btn btn-primary-custom shadow-sm" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-circle-fill me-1"></i> Upload Resource
          </button>
        )}
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Search & Category Filter Toolbar */}
      <div className="card card-modern p-3 border bg-white mb-4 shadow-sm">
        <div className="row g-3 align-items-center">
          <div className="col-lg-6">
            <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by title, author, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-outline-primary px-3">
                Search
              </button>
            </form>
          </div>

          <div className="col-lg-6">
            <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'ALL' ? 'All Materials' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="text-muted mt-2">Loading library materials...</div>
        </div>
      ) : resources.length === 0 ? (
        <div className="card card-modern p-5 text-center bg-white border">
          <i className="bi bi-journal-x text-muted display-3 mb-3"></i>
          <h4 className="fw-bold text-dark">No Resources Found</h4>
          <p className="text-muted mb-0">Try changing your search terms or selecting a different category.</p>
        </div>
      ) : (
        <div className="row g-4">
          {resources.map((item) => (
            <div key={item.id} className="col-md-6 col-lg-4">
              <div className="card card-modern h-100 p-4 border bg-white d-flex flex-column shadow-sm">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className={`badge ${getCategoryBadgeClass(item.category)}`}>
                    {item.category}
                  </span>
                  <span className="badge bg-light text-muted border font-monospace" style={{ fontSize: '0.7rem' }}>
                    {item.fileType || 'PDF'}
                  </span>
                </div>

                <h5 className="fw-bold text-dark mb-1 line-clamp-2" title={item.title}>
                  {item.title}
                </h5>

                <div className="small text-muted mb-2">
                  <i className="bi bi-person me-1"></i>
                  {item.author || 'Academic Faculty'}
                </div>

                <div className="badge bg-light text-secondary border align-self-start mb-3">
                  <i className="bi bi-bookmark me-1"></i> {item.subject || 'General'}
                </div>

                <p className="text-secondary small flex-grow-1 mb-3">
                  {item.description || 'Verified course reference material and lecture companion.'}
                </p>

                <div className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center">
                  <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                    By {item.uploadedBy || 'Faculty'}
                  </div>

                  <div className="d-flex gap-2">
                    {item.resourceUrl ? (
                      <a
                        href={item.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i> View / Open
                      </a>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => alert(`Opening resource: ${item.title}`)}
                      >
                        <i className="bi bi-file-earmark-text me-1"></i> Open
                      </button>
                    )}

                    {canManage && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteResource(item.id, item.title)}
                        title="Delete Resource"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal (Teachers/Admin) */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-modern border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-cloud-arrow-up text-primary me-2"></i> Add Library Resource
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Resource Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Operating System Concepts 10th Ed."
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Author(s)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Silberschatz & Galvin"
                        value={resourceForm.author}
                        onChange={(e) => setResourceForm({ ...resourceForm, author: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Computer Science"
                        value={resourceForm.subject}
                        onChange={(e) => setResourceForm({ ...resourceForm, subject: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={resourceForm.category}
                        onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                      >
                        <option value="Book">Book</option>
                        <option value="Notes">Notes</option>
                        <option value="PDF">PDF</option>
                        <option value="Study Material">Study Material</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">File / Resource Type</label>
                      <select
                        className="form-select"
                        value={resourceForm.fileType}
                        onChange={(e) => setResourceForm({ ...resourceForm, fileType: e.target.value })}
                      >
                        <option value="PDF">PDF</option>
                        <option value="Document">Document / Docx</option>
                        <option value="EPUB">EPUB / eBook</option>
                        <option value="Link">External Web Resource</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Resource URL / Link</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://... or link to Google Drive / Web PDF"
                      value={resourceForm.resourceUrl}
                      onChange={(e) => setResourceForm({ ...resourceForm, resourceUrl: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Brief overview of topics covered in this material..."
                      value={resourceForm.description}
                      onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom" disabled={submitting}>
                    {submitting ? 'Uploading...' : 'Publish to Library'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalLibrary;
