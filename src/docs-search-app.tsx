import React, { useState, useEffect, useRef } from 'react';
import { Search, Link, File, X, ExternalLink, Eye, Shield, Users, Clock, ChevronRight, Loader, Upload, FileText, Save, AlertCircle, Check } from 'lucide-react';

const CONTROLLED_TAGS = {
  docType: ['spec', 'runbook', 'design', 'postmortem', 'SOP', 'decision', 'PRD', 'brief'],
  system: ['payments', 'auth', 'data-platform', 'mobile', 'web', 'infrastructure'],
  lifecycle: ['draft', 'in-review', 'approved', 'deprecated', 'stale'],
  confidentiality: ['public-internal', 'restricted', 'secret'],
  audience: ['eng', 'ops', 'product', 'exec', 'all-hands']
};

const TEAMS = ['qa', 'dev', 'ba', 'sa', 'payments', 'platform'];

// Unified AddDocumentModal component that handles all creation methods
const AddDocumentModal = ({ 
  form, 
  setForm, 
  errors, 
  setErrors,
  setShowAdd, 
  isSaving,
  searchQuery,
  performSearch
}) => {
  const [inputMethod, setInputMethod] = useState('write'); // 'write', 'upload', 'url'
  
  const detectInputType = (input) => {
    if (!input) return null;
    const urlPattern = /^(https?:\/\/|www\.)/i;
    return urlPattern.test(input) ? 'url' : 'file';
  };

  const validateForm = () => {
    const newErrors = {};
    const titlePattern = /^[A-Z][a-z]+\.[A-Z][a-z]+\s-\s.+$/;
    
    if (!form.title) newErrors.title = 'Required';
    else if (!titlePattern.test(form.title)) {
      newErrors.title = 'Format: System.Topic - Purpose';
    }
    
    if (inputMethod === 'write') {
      if (!form.content || form.content.length < 10) {
        newErrors.content = 'Document content is required (minimum 10 characters)';
      }
    } else if (inputMethod === 'url') {
      if (!form.input || !detectInputType(form.input)) {
        newErrors.input = 'Valid URL is required';
      }
    } else if (inputMethod === 'upload') {
      if (!form.input) {
        newErrors.input = 'File is required';
      }
    }
    
    if (!form.owningTeam) newErrors.owningTeam = 'Required';
    if (!form.docType) newErrors.docType = 'Required';
    if (!form.confidentiality) newErrors.confidentiality = 'Required';
    if (!form.audience) newErrors.audience = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (forceDraft = false) => {
    if (!forceDraft && !validateForm()) return;
    
    try {
      let endpoint = '/api/upload/create';
      let payload = {
        title: form.title || 'Untitled Document',
        owningTeam: form.owningTeam || 'unassigned',
        docType: form.docType || 'draft',
        system: form.system,
        lifecycle: forceDraft ? 'draft' : form.lifecycle,
        confidentiality: form.confidentiality || 'public-internal',
        audience: form.audience || 'all-hands',
        tags: form.tags
      };
      
      if (inputMethod === 'write') {
        payload.content = form.content;
      } else if (inputMethod === 'url') {
        endpoint = '/api/upload/url';
        payload.url = form.input;
      } else if (inputMethod === 'upload') {
        payload.content = form.input;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Document creation failed');
      }
      
      if (searchQuery.trim()) {
        performSearch();
      }
      
      setShowAdd(false);
      setForm({
        title: '',
        content: '',
        input: '',
        owningTeam: '',
        docType: '',
        confidentiality: '',
        audience: '',
        lifecycle: 'draft',
        system: '',
        tags: ''
      });
      setInputMethod('write');
    } catch (error) {
      console.error('Creation error:', error);
      alert(`Document creation failed: ${error.message}`);
    }
  };

  const allRequiredFieldsFilled = form.title && 
    form.owningTeam && form.docType && 
    form.confidentiality && form.audience &&
    ((inputMethod === 'write' && form.content) ||
     (inputMethod === 'url' && form.input) ||
     (inputMethod === 'upload' && form.input));
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl w-full max-w-6xl max-h-[90vh] border border-slate-600/50 shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-600/50 flex-shrink-0 bg-slate-800/50 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Add Document</h2>
            </div>
            <button
              onClick={() => setShowAdd(false)}
              className="w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center group"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-slate-800/30">
          <div className="p-6">
            {/* Input Method Selection */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-3">
                How would you like to add content?
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setInputMethod('write')}
                  className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all ${
                    inputMethod === 'write'
                      ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                      : 'bg-slate-700/30 border border-slate-600/30 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Write Content
                </button>
                <button
                  onClick={() => setInputMethod('upload')}
                  className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all ${
                    inputMethod === 'upload'
                      ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                      : 'bg-slate-700/30 border border-slate-600/30 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  onClick={() => setInputMethod('url')}
                  className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all ${
                    inputMethod === 'url'
                      ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                      : 'bg-slate-700/30 border border-slate-600/30 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <Link className="w-4 h-4" />
                  Add URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Title * <span className="text-slate-600">(System.Topic - Purpose)</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    placeholder="Payments.Refunds - Runbook"
                    className={`w-full px-4 py-3 bg-slate-700/50 border ${
                      errors.title ? 'border-red-400' : 'border-slate-600/50'
                    } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-slate-700/70 transition-all duration-200`}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                {inputMethod === 'write' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm({...form, content: e.target.value})}
                      placeholder="Start typing your document here..."
                      className={`w-full px-4 py-4 bg-slate-700/50 border ${
                        errors.content ? 'border-red-400' : 'border-slate-600/50'
                      } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 min-h-[400px] resize-none`}
                    />
                    {errors.content && (
                      <p className="text-red-400 text-xs mt-1">{errors.content}</p>
                    )}
                  </div>
                )}

                {inputMethod === 'upload' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      File Upload *
                    </label>
                    <div className={`border-2 border-dashed ${
                      errors.input ? 'border-red-400' : 'border-slate-600'
                    } rounded-xl p-8 text-center bg-slate-700/20`}>
                      <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400 mb-2">Drag and drop your file here, or</p>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setForm({...form, input: file.name});
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.xml"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-block px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg cursor-pointer transition-colors"
                      >
                        Browse Files
                      </label>
                      {form.input && (
                        <p className="text-green-400 text-sm mt-2">Selected: {form.input}</p>
                      )}
                    </div>
                    {errors.input && (
                      <p className="text-red-400 text-xs mt-1">{errors.input}</p>
                    )}
                  </div>
                )}

                {inputMethod === 'url' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={form.input}
                      onChange={(e) => setForm({...form, input: e.target.value})}
                      placeholder="https://example.com/document"
                      className={`w-full px-4 py-3 bg-slate-700/50 border ${
                        errors.input ? 'border-red-400' : 'border-slate-600/50'
                      } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400`}
                    />
                    {errors.input && (
                      <p className="text-red-400 text-xs mt-1">{errors.input}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Metadata Section */}
              <div className="space-y-4">
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-2xl p-5 space-y-4">
                  <h3 className="text-base font-semibold text-white mb-4">Document Metadata</h3>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Team *</label>
                    <select
                      value={form.owningTeam}
                      onChange={(e) => setForm({...form, owningTeam: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white"
                    >
                      <option value="">Select team</option>
                      {TEAMS.map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Type *</label>
                    <select
                      value={form.docType}
                      onChange={(e) => setForm({...form, docType: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white"
                    >
                      <option value="">Select type</option>
                      {CONTROLLED_TAGS.docType.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Access Level *</label>
                    <select
                      value={form.confidentiality}
                      onChange={(e) => setForm({...form, confidentiality: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white"
                    >
                      <option value="">Select access</option>
                      {CONTROLLED_TAGS.confidentiality.map(conf => (
                        <option key={conf} value={conf}>{conf}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Audience *</label>
                    <select
                      value={form.audience}
                      onChange={(e) => setForm({...form, audience: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white"
                    >
                      <option value="">Select audience</option>
                      {CONTROLLED_TAGS.audience.map(aud => (
                        <option key={aud} value={aud}>{aud}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-slate-600/50 bg-slate-800/50 rounded-b-3xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={() => handleFormSubmit(false)}
              disabled={!allRequiredFieldsFilled || isSaving}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white rounded-xl transition-all font-medium flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Add Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Browse Modal component for team-based document browsing
const BrowseModal = ({
  showBrowse,
  setShowBrowse,
  selectedTeam,
  setSelectedTeam,
  browseResults,
  setBrowseResults,
  handleDocumentClick
}) => {
  const browseByTeam = async (team) => {
    setSelectedTeam(team);
    try {
      const response = await fetch(`http://localhost:3001/api/documents?team=${encodeURIComponent(team)}`);
      if (!response.ok) {
        throw new Error('Browse failed');
      }
      const data = await response.json();
      setBrowseResults(data.documents || []);
    } catch (error) {
      console.error('Browse error:', error);
      setBrowseResults([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[80vh] border border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Browse Documents by Team</h2>
            <button
              onClick={() => {
                setShowBrowse(false);
                setSelectedTeam('');
                setBrowseResults([]);
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          {!selectedTeam ? (
            <div>
              <h3 className="text-white font-medium mb-4">Select a Team</h3>
              <div className="grid grid-cols-2 gap-3">
                {TEAMS.map(team => (
                  <button
                    key={team}
                    onClick={() => browseByTeam(team)}
                    className="p-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-left transition-colors flex items-center gap-3"
                  >
                    <Users className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-medium capitalize">{team}</div>
                      <div className="text-xs text-slate-400">Browse {team} documents</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => {
                    setSelectedTeam('');
                    setBrowseResults([]);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <h3 className="text-white font-medium">{selectedTeam.toUpperCase()} Documents</h3>
              </div>
              
              <div className="space-y-2">
                {browseResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No documents found for {selectedTeam}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {browseResults.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          handleDocumentClick(doc);
                          // Don't close browse modal when viewing document
                        }}
                        className="group p-4 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                {doc.title}
                              </h4>
                              {doc.lifecycle === 'deprecated' && (
                                <span className="px-2 py-0.5 bg-orange-900/50 text-orange-400 text-xs rounded">
                                  deprecated
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-1">
                              {doc.extractedText}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 mt-1" />
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            {doc.source === 'link' ? <Link className="w-3 h-3" /> : 
                             doc.source === 'created' ? <FileText className="w-3 h-3" /> : 
                             <File className="w-3 h-3" />}
                            {doc.docType}
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {doc.confidentiality}
                          </div>
                          {doc.nextReview && (
                            <div className="flex items-center gap-1 text-orange-500">
                              <Clock className="w-3 h-3" />
                              Review {doc.nextReview}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Document Viewer Modal
const DocumentViewer = ({
  selectedDoc,
  viewerAction,
  setViewerAction,
  setSelectedDoc,
  onCancel
}) => {
  const handleDownload = () => {
    if (selectedDoc.url) {
      window.open(selectedDoc.url, '_blank');
    } else {
      const blob = new Blob([selectedDoc.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDoc.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setViewerAction(null);
    setSelectedDoc(null);
  };

  const handleViewInline = () => {
    setViewerAction('inline');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {viewerAction === 'prompt' ? (
        <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
          <h3 className="text-white font-medium mb-4">{selectedDoc.title}</h3>
          <p className="text-slate-400 text-sm mb-6">
            How would you like to view this document?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {selectedDoc.url ? 'Open Link' : 'Download'}
            </button>
            <button
              onClick={handleViewInline}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Here
            </button>
          </div>
          <button
            onClick={() => {
              setViewerAction(null);
              setSelectedDoc(null);
              if (onCancel) onCancel();
            }}
            className="w-full mt-3 px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[80vh] border border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">{selectedDoc.title}</h3>
              <p className="text-slate-400 text-sm">
                {selectedDoc.docType}
              </p>
            </div>
            <button
              onClick={() => {
                setViewerAction(null);
                setSelectedDoc(null);
                if (onCancel) onCancel();
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-slate-300 font-mono text-sm">
                {selectedDoc.content}
              </pre>
            </div>
          </div>
          <div className="p-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
            <div className="flex gap-4">
              <span>Owner: {selectedDoc.owner}</span>
              <span>Team: {selectedDoc.owningTeam}</span>
              {selectedDoc.nextReview && (
                <span className="text-orange-400">Review: {selectedDoc.nextReview}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DocsSearchApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewerAction, setViewerAction] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [browseResults, setBrowseResults] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const searchInputRef = useRef(null);
  
  const [form, setForm] = useState({
    title: '',
    content: '',
    input: '',
    owningTeam: '',
    docType: '',
    confidentiality: '',
    audience: '',
    lifecycle: 'draft',
    system: '',
    tags: ''
  });
  
  const [errors, setErrors] = useState({});

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [searchQuery]);

  useEffect(() => {
    if (!showAdd && !showBrowse && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showAdd, showBrowse]);

  const handleDocumentClick = (doc) => {
    setSelectedDoc(doc);
    setViewerAction('prompt');
  };

  const handleDocumentViewerCancel = () => {
    // If we're in browse mode, keep the browse modal open
    // If we're in search mode, just close the viewer
    if (showBrowse && selectedTeam && browseResults.length > 0) {
      // Stay in browse mode - don't close anything
      return;
    }
    // For search results, we can close everything
  };

  const handleDownloadOrView = (action) => {
    if (action === 'download') {
      if (selectedDoc.url) {
        window.open(selectedDoc.url, '_blank');
      } else {
        const blob = new Blob([selectedDoc.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedDoc.title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setViewerAction(null);
      setSelectedDoc(null);
    } else if (action === 'view') {
      setViewerAction('inline');
    }
  };

  const hasSearched = searchQuery.length > 0;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className={`w-full px-4 transition-all duration-500 ${hasSearched ? 'pt-8' : 'pt-32'}`}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full pl-14 pr-6 py-5 bg-slate-800 border border-slate-700 rounded-full text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-all text-lg"
                autoFocus
              />
            </div>
            
            {/* Action buttons - consistent design with smooth transitions */}
            <div className={`flex justify-center transition-all duration-300 ${hasSearched ? 'mt-3 space-x-2' : 'mt-6 space-x-4'}`}>
              <button
                onClick={() => setShowAdd(true)}
                className={`transition-all duration-300 bg-slate-800 hover:bg-slate-700 text-white rounded-full border border-slate-700 flex items-center gap-2 ${
                  hasSearched 
                    ? 'px-4 py-2.5 text-sm opacity-90 hover:opacity-100' 
                    : 'px-6 py-3 text-base shadow-lg hover:shadow-xl'
                }`}
              >
                <FileText className="w-4 h-4" />
                Add Document
              </button>
              <button
                onClick={() => setShowBrowse(true)}
                className={`transition-all duration-300 bg-slate-800 hover:bg-slate-700 text-white rounded-full border border-slate-700 flex items-center gap-2 ${
                  hasSearched 
                    ? 'px-4 py-2.5 text-sm opacity-90 hover:opacity-100' 
                    : 'px-6 py-3 text-base shadow-lg hover:shadow-xl'
                }`}
              >
                <Users className="w-4 h-4" />
                Browse by Group
              </button>
            </div>
          </div>

          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-5 h-5 text-slate-500 animate-spin" />
            </div>
          )}

          {!isSearching && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No results for "{searchQuery}"</p>
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="space-y-1 mt-6">
              {searchResults.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => {
                    handleDocumentClick(doc);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="group p-4 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                          {doc.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-1">
                        {doc.extractedText}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 mt-1" />
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      {doc.source === 'link' ? <Link className="w-3 h-3" /> : 
                       doc.source === 'created' ? <FileText className="w-3 h-3" /> : 
                       <File className="w-3 h-3" />}
                      {doc.docType}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {doc.owningTeam}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd && <AddDocumentModal 
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        setShowAdd={setShowAdd}
        isSaving={isSaving}
        searchQuery={searchQuery}
        performSearch={performSearch}
      />}
      
      {showBrowse && <BrowseModal
        showBrowse={showBrowse}
        setShowBrowse={setShowBrowse}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        browseResults={browseResults}
        setBrowseResults={setBrowseResults}
        handleDocumentClick={handleDocumentClick}
      />}
      
      {selectedDoc && viewerAction && <DocumentViewer
        selectedDoc={selectedDoc}
        viewerAction={viewerAction}
        setViewerAction={setViewerAction}
        setSelectedDoc={setSelectedDoc}
        onCancel={handleDocumentViewerCancel}
      />}
    </div>
  );
}