import React, { useState, useEffect, useRef } from 'react';
import { Search, Link, File, X, ExternalLink, Eye, Shield, Users, Clock, ChevronRight, Loader, Upload, FileText, Save, AlertCircle, Check } from 'lucide-react';

const CONTROLLED_TAGS = {
  docType: ['spec', 'runbook', 'design', 'postmortem', 'SOP', 'decision', 'PRD', 'brief'],
  system: ['payments', 'auth', 'data-platform', 'mobile', 'web', 'infrastructure'],
  lifecycle: ['draft', 'in-review', 'approved', 'deprecated', 'stale'],
  confidentiality: ['public-internal', 'restricted', 'secret'],
  audience: ['eng', 'ops', 'product', 'exec', 'all-hands']
};

const TEAMS = ['platform', 'payments', 'mobile', 'web', 'data', 'security'];

// UploadModal component moved outside main component to prevent re-creation
const UploadModal = ({ 
  uploadForm, 
  setUploadForm, 
  uploadErrors, 
  setShowUpload, 
  handleUpload, 
  isSaving 
}) => {
  const detectInputType = (input) => {
    if (!input) return null;
    const urlPattern = /^(https?:\/\/|www\.)/i;
    return urlPattern.test(input) ? 'link' : 'file';
  };

  const inputType = detectInputType(uploadForm.input);
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Add Document</h2>
            <button
              onClick={() => setShowUpload(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Source *
            </label>
            <div className="relative">
              <input
                type="text"
                value={uploadForm.input}
                onChange={(e) => setUploadForm({...uploadForm, input: e.target.value})}
                placeholder="Paste URL or drag file here"
                className={`w-full px-4 py-3 bg-slate-700 border ${
                  uploadErrors.input ? 'border-red-500' : 'border-slate-600'
                } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors`}
              />
              {inputType && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {inputType === 'link' ? (
                    <Link className="w-4 h-4 text-blue-400" />
                  ) : (
                    <File className="w-4 h-4 text-green-400" />
                  )}
                </div>
              )}
            </div>
            {uploadErrors.input && (
              <p className="text-red-400 text-xs mt-1">{uploadErrors.input}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Title * <span className="text-slate-600">(System.Topic - Purpose)</span>
            </label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
              placeholder="Payments.Refunds - Runbook"
              className={`w-full px-4 py-3 bg-slate-700 border ${
                uploadErrors.title ? 'border-red-500' : 'border-slate-600'
              } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors`}
            />
            {uploadErrors.title && (
              <p className="text-red-400 text-xs mt-1">{uploadErrors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Team *
              </label>
              <select
                value={uploadForm.owningTeam}
                onChange={(e) => setUploadForm({...uploadForm, owningTeam: e.target.value})}
                className={`w-full px-4 py-3 bg-slate-700 border ${
                  uploadErrors.owningTeam ? 'border-red-500' : 'border-slate-600'
                } rounded-xl text-white focus:outline-none focus:border-slate-500 transition-colors`}
              >
                <option value="">Select</option>
                {TEAMS.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Type *
              </label>
              <select
                value={uploadForm.docType}
                onChange={(e) => setUploadForm({...uploadForm, docType: e.target.value})}
                className={`w-full px-4 py-3 bg-slate-700 border ${
                  uploadErrors.docType ? 'border-red-500' : 'border-slate-600'
                } rounded-xl text-white focus:outline-none focus:border-slate-500 transition-colors`}
              >
                <option value="">Select</option>
                {CONTROLLED_TAGS.docType.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                System
              </label>
              <select
                value={uploadForm.system}
                onChange={(e) => setUploadForm({...uploadForm, system: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-slate-500 transition-colors"
              >
                <option value="">Select</option>
                {CONTROLLED_TAGS.system.map(sys => (
                  <option key={sys} value={sys}>{sys}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Access *
              </label>
              <select
                value={uploadForm.confidentiality}
                onChange={(e) => setUploadForm({...uploadForm, confidentiality: e.target.value})}
                className={`w-full px-4 py-3 bg-slate-700 border ${
                  uploadErrors.confidentiality ? 'border-red-500' : 'border-slate-600'
                } rounded-xl text-white focus:outline-none focus:border-slate-500 transition-colors`}
              >
                <option value="">Select</option>
                {CONTROLLED_TAGS.confidentiality.map(conf => (
                  <option key={conf} value={conf}>{conf}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Audience *
              </label>
              <select
                value={uploadForm.audience}
                onChange={(e) => setUploadForm({...uploadForm, audience: e.target.value})}
                className={`w-full px-4 py-3 bg-slate-700 border ${
                  uploadErrors.audience ? 'border-red-500' : 'border-slate-600'
                } rounded-xl text-white focus:outline-none focus:border-slate-500 transition-colors`}
              >
                <option value="">Select</option>
                {CONTROLLED_TAGS.audience.map(aud => (
                  <option key={aud} value={aud}>{aud}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Tags <span className="text-slate-600">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={uploadForm.tags}
              onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
              placeholder="critical, on-call, migration"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          {['runbook', 'SOP'].includes(uploadForm.docType) && (
            <div className="bg-orange-900/20 border border-orange-900/50 rounded-xl p-3">
              <p className="text-sm text-orange-400">
                90-day review cycle will be enforced automatically
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700">
          <button
            onClick={handleUpload}
            disabled={isSaving}
            className="w-full px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Adding...' : 'Add Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

// CreateModal component moved outside main component to prevent re-creation
const CreateModal = ({ 
  createForm, 
  setCreateForm, 
  createErrors, 
  setCreateErrors,
  setShowCreate, 
  isSaving,
  searchQuery,
  performSearch
}) => {
  const validateCreate = () => {
    const errors = {};
    const titlePattern = /^[A-Z][a-z]+\.[A-Z][a-z]+\s-\s.+$/;
    
    if (!createForm.title) errors.title = 'Required';
    else if (!titlePattern.test(createForm.title)) {
      errors.title = 'Format: System.Topic - Purpose';
    }
    if (!createForm.content || createForm.content.length < 10) {
      errors.content = 'Document content is required (minimum 10 characters)';
    }
    if (!createForm.owningTeam) errors.owningTeam = 'Required';
    if (!createForm.docType) errors.docType = 'Required';
    if (!createForm.confidentiality) errors.confidentiality = 'Required';
    if (!createForm.audience) errors.audience = 'Required';
    
    return errors;
  };

  const handleCreate = async (forceDraft = false) => {
    const errors = validateCreate();
    if (!forceDraft && Object.keys(errors).length > 0) return;
    
    try {
      const response = await fetch('/api/upload/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: createForm.title || 'Untitled Document',
          content: createForm.content,
          owningTeam: createForm.owningTeam || 'unassigned',
          docType: createForm.docType || 'draft',
          system: createForm.system,
          lifecycle: forceDraft ? 'draft' : createForm.lifecycle,
          confidentiality: createForm.confidentiality || 'public-internal',
          audience: createForm.audience || 'all-hands',
          tags: createForm.tags
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Document creation failed');
      }
      
      const result = await response.json();
      
      // Refresh search results if we're currently searching
      if (searchQuery.trim()) {
        performSearch();
      }
      
      setShowCreate(false);
      setCreateForm({
        title: '',
        content: '',
        owningTeam: '',
        docType: '',
        confidentiality: '',
        audience: '',
        lifecycle: 'draft',
        system: '',
        tags: ''
      });
    } catch (error) {
      console.error('Create error:', error);
      alert(`Document creation failed: ${error.message}`);
    }
  };

  const allRequiredFieldsFilled = createForm.title && createForm.content && 
    createForm.owningTeam && createForm.docType && 
    createForm.confidentiality && createForm.audience;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl w-full max-w-5xl max-h-[90vh] border border-slate-600/50 shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-600/50 flex-shrink-0 bg-slate-800/50 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Create Document</h2>
                {createForm.content && createForm.content.length > 50 && (
                  <span className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    Auto-save enabled
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                if (createForm.content && createForm.content.length > 10) {
                  if (confirm('Discard unsaved changes?')) {
                    setShowCreate(false);
                    setCreateForm({
                      title: '',
                      content: '',
                      owningTeam: '',
                      docType: '',
                      confidentiality: '',
                      audience: '',
                      lifecycle: 'draft',
                      system: '',
                      tags: ''
                    });
                  }
                } else {
                  setShowCreate(false);
                }
              }}
              className="w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center group"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-slate-800/30">
          <div className="p-6">
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Title * <span className="text-slate-600">(System.Topic - Purpose)</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                    placeholder="Payments.Refunds - Runbook"
                    className={`w-full px-4 py-3 bg-slate-700/50 border ${
                      createErrors.title ? 'border-red-400' : 'border-slate-600/50'
                    } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-slate-700/70 transition-all duration-200`}
                  />
                  {createErrors.title && (
                    <p className="text-red-400 text-xs mt-1">{createErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Content * <span className="text-slate-600">(Rich editor: text, images, videos, links supported)</span>
                  </label>
                                      <div className={`bg-slate-700/30 border ${
                      createErrors.content ? 'border-red-400' : 'border-slate-600/50'
                    } rounded-xl p-1 focus-within:border-blue-400 transition-all duration-200`}>
                      <div className="flex items-center gap-2 p-3 border-b border-slate-600/50">
                        <button className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg text-sm font-medium transition-all duration-200">B</button>
                        <button className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg text-sm italic transition-all duration-200">I</button>
                        <button className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg text-sm transition-all duration-200">Link</button>
                        <button className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg text-sm transition-all duration-200">Image</button>
                        <button className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg text-sm transition-all duration-200">Video</button>
                        <button className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg text-sm transition-all duration-200">Code</button>
                      </div>
                      <textarea
                        value={createForm.content}
                        onChange={(e) => setCreateForm({...createForm, content: e.target.value})}
                        placeholder="Start typing your document here... You can add text, embed images, videos, and links."
                        className="w-full px-4 py-4 bg-transparent text-white placeholder-slate-400 focus:outline-none min-h-[400px] resize-none"
                      />
                    </div>
                  {createErrors.content && (
                    <p className="text-red-400 text-xs mt-1">{createErrors.content}</p>
                  )}
                </div>
              </div>

                              <div className="space-y-4">
                  <div className="bg-slate-700/30 border border-slate-600/30 rounded-2xl p-5 space-y-4">
                    <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-3 h-3 text-blue-400" />
                      </div>
                      Document Metadata
                    </h3>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Team *
                    </label>
                    <select
                      value={createForm.owningTeam}
                      onChange={(e) => setCreateForm({...createForm, owningTeam: e.target.value})}
                      className={`w-full px-3 py-2.5 bg-slate-700/50 border ${
                        createErrors.owningTeam ? 'border-red-400' : 'border-slate-600/50'
                      } rounded-lg text-white text-sm focus:outline-none focus:border-blue-400 focus:bg-slate-700/70 transition-all duration-200`}
                    >
                      <option value="">Select</option>
                      {TEAMS.map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Type *
                    </label>
                    <select
                      value={createForm.docType}
                      onChange={(e) => setCreateForm({...createForm, docType: e.target.value})}
                      className={`w-full px-3 py-2 bg-slate-700 border ${
                        createErrors.docType ? 'border-red-500' : 'border-slate-600'
                      } rounded-lg text-white text-sm focus:outline-none focus:border-slate-500 transition-colors`}
                    >
                      <option value="">Select</option>
                      {CONTROLLED_TAGS.docType.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      System
                    </label>
                    <select
                      value={createForm.system}
                      onChange={(e) => setCreateForm({...createForm, system: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400 focus:bg-slate-700/70 transition-all duration-200"
                    >
                      <option value="">Select</option>
                      {CONTROLLED_TAGS.system.map(sys => (
                        <option key={sys} value={sys}>{sys}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Access *
                    </label>
                    <select
                      value={createForm.confidentiality}
                      onChange={(e) => setCreateForm({...createForm, confidentiality: e.target.value})}
                      className={`w-full px-3 py-2 bg-slate-700 border ${
                        createErrors.confidentiality ? 'border-red-500' : 'border-slate-600'
                      } rounded-lg text-white text-sm focus:outline-none focus:border-slate-500 transition-colors`}
                    >
                      <option value="">Select</option>
                      {CONTROLLED_TAGS.confidentiality.map(conf => (
                        <option key={conf} value={conf}>{conf}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Audience *
                    </label>
                    <select
                      value={createForm.audience}
                      onChange={(e) => setCreateForm({...createForm, audience: e.target.value})}
                      className={`w-full px-3 py-2 bg-slate-700 border ${
                        createErrors.audience ? 'border-red-500' : 'border-slate-600'
                      } rounded-lg text-white text-sm focus:outline-none focus:border-slate-500 transition-colors`}
                    >
                      <option value="">Select</option>
                      {CONTROLLED_TAGS.audience.map(aud => (
                        <option key={aud} value={aud}>{aud}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Lifecycle
                    </label>
                    <select
                      value={createForm.lifecycle}
                      onChange={(e) => setCreateForm({...createForm, lifecycle: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400 focus:bg-slate-700/70 transition-all duration-200"
                    >
                      {CONTROLLED_TAGS.lifecycle.map(lc => (
                        <option key={lc} value={lc}>{lc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Tags <span className="text-slate-600">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.tags}
                      onChange={(e) => setCreateForm({...createForm, tags: e.target.value})}
                      placeholder="critical, on-call"
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-slate-700/70 transition-all duration-200"
                    />
                  </div>
                </div>

                {['runbook', 'SOP'].includes(createForm.docType) && (
                  <div className="bg-orange-900/20 border border-orange-900/50 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-orange-400">
                        90-day review cycle will be enforced
                      </p>
                    </div>
                  </div>
                )}

                {!allRequiredFieldsFilled && (
                  <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-red-400">
                        <p className="font-medium mb-1">Cannot publish yet</p>
                        <p>Complete all required fields or save as draft</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {allRequiredFieldsFilled && (
                  <div className="bg-green-900/20 border border-green-900/50 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-400">
                        Ready to publish
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

                  <div className="p-6 border-t border-slate-600/50 flex-shrink-0 bg-slate-800/50 rounded-b-3xl">
            <div className="flex gap-4">
            <button
              onClick={() => {
                if (createForm.content && createForm.content.length > 10) {
                  if (confirm('Discard unsaved changes?')) {
                    setShowCreate(false);
                    setCreateForm({
                      title: '',
                      content: '',
                      owningTeam: '',
                      docType: '',
                      confidentiality: '',
                      audience: '',
                      lifecycle: 'draft',
                      system: '',
                      tags: ''
                    });
                  }
                } else {
                  setShowCreate(false);
                }
              }}
              className="px-6 py-3 border border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/50 text-white font-medium rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            
            {createForm.content && createForm.content.length > 10 && (
              <button
                onClick={() => handleCreate(true)}
                disabled={isSaving}
                className="px-6 py-3 bg-slate-700/70 hover:bg-slate-600/70 border border-slate-600/50 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>
            )}
            
            <button
              onClick={() => {
                if (createForm.lifecycle === 'draft') {
                  setCreateForm({...createForm, lifecycle: 'in-review'});
                }
                handleCreate(false);
              }}
              disabled={!allRequiredFieldsFilled || isSaving}
              className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                allRequiredFieldsFilled && !isSaving
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl border border-blue-400/50'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600/50'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Document'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DocsSearchApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  
  // Focus management
  useEffect(() => {
    if (showCreate) {
      setShowCreate(false);
    }
  }, []);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewerAction, setViewerAction] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [browseResults, setBrowseResults] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const searchInputRef = useRef(null);
  
  const [uploadForm, setUploadForm] = useState({
    input: '',
    inputType: null,
    title: '',
    owningTeam: '',
    docType: '',
    confidentiality: '',
    audience: '',
    lifecycle: 'draft',
    system: '',
    tags: ''
  });
  
  const [uploadErrors, setUploadErrors] = useState({});
  
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    owningTeam: '',
    docType: '',
    confidentiality: '',
    audience: '',
    lifecycle: 'draft',
    system: '',
    tags: ''
  });
  
  const [createErrors, setCreateErrors] = useState({});
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: 'Payments.Refunds - Runbook',
      owningTeam: 'payments',
      owner: 'alex.chen',
      docType: 'runbook',
      system: 'payments',
      lifecycle: 'approved',
      confidentiality: 'restricted',
      audience: 'eng',
      tags: ['critical', 'on-call'],
      extractedText: 'Step-by-step guide for handling refund failures in production. Includes rollback procedures and escalation paths.',
      lastReviewed: '2025-01-15',
      nextReview: '2025-04-15',
      uploadedAt: '2024-11-20',
      source: 'file',
      fileSize: '2.4 MB',
      url: null,
      content: `# Refunds Runbook\n\n## Alert Response\n1. Check metrics dashboard\n2. Verify payment service health\n3. Check error rates in logs\n\n## Mitigation Steps\n1. Enable circuit breaker if error rate > 5%\n2. Route traffic to secondary region\n3. Page on-call lead if not resolved in 15 minutes`
    },
    {
      id: 2,
      title: 'Auth.SSO - Technical Spec',
      owningTeam: 'platform',
      owner: 'sarah.kim',
      docType: 'spec',
      system: 'auth',
      lifecycle: 'in-review',
      confidentiality: 'public-internal',
      audience: 'eng',
      tags: ['security', 'architecture'],
      extractedText: 'Single sign-on implementation using SAML 2.0 protocol with Okta integration.',
      lastReviewed: '2025-01-10',
      nextReview: '2025-02-10',
      uploadedAt: '2025-01-05',
      source: 'link',
      fileSize: null,
      url: 'https://internal.docs/auth-sso-spec',
      content: `# SSO Technical Specification\n\n## Overview\nImplementing SAML 2.0 based SSO with Okta as IdP\n\n## Architecture\n- Service Provider: Our platform\n- Identity Provider: Okta\n- Protocol: SAML 2.0\n\n## Security Considerations\n- Token expiry: 1 hour\n- Refresh token: 24 hours\n- MFA required for admin roles`
    }
  ]);

  const detectInputType = (input) => {
    if (!input) return null;
    const urlPattern = /^(https?:\/\/|www\.)/i;
    return urlPattern.test(input) ? 'link' : 'file';
  };

  const validateUpload = () => {
    const errors = {};
    const titlePattern = /^[A-Z][a-z]+\.[A-Z][a-z]+\s-\s.+$/;
    
    if (!uploadForm.input) errors.input = 'File or URL required';
    if (!uploadForm.title) errors.title = 'Required';
    else if (!titlePattern.test(uploadForm.title)) {
      errors.title = 'Format: System.Topic - Purpose';
    }
    if (!uploadForm.owningTeam) errors.owningTeam = 'Required';
    if (!uploadForm.docType) errors.docType = 'Required';
    if (!uploadForm.confidentiality) errors.confidentiality = 'Required';
    if (!uploadForm.audience) errors.audience = 'Required';
    
    setUploadErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpload = async () => {
    if (!validateUpload()) return;
    
    const inputType = detectInputType(uploadForm.input);
    
    try {
      let response;
      
      if (inputType === 'link') {
        // Upload URL
        response = await fetch('/api/upload/url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: uploadForm.input,
            title: uploadForm.title,
            owningTeam: uploadForm.owningTeam,
            docType: uploadForm.docType,
            system: uploadForm.system,
            lifecycle: uploadForm.lifecycle,
            confidentiality: uploadForm.confidentiality,
            audience: uploadForm.audience,
            tags: uploadForm.tags
          })
        });
      } else {
        // For now, we'll handle file uploads through the create endpoint
        // In a real implementation, you'd use FormData for file uploads
        response = await fetch('/api/upload/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: uploadForm.title,
            content: `Content from ${uploadForm.input} would be extracted here.`,
            owningTeam: uploadForm.owningTeam,
            docType: uploadForm.docType,
            system: uploadForm.system,
            lifecycle: uploadForm.lifecycle,
            confidentiality: uploadForm.confidentiality,
            audience: uploadForm.audience,
            tags: uploadForm.tags
          })
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      // Refresh search results if we're currently searching
      if (searchQuery.trim()) {
        performSearch();
      }
      
      setShowUpload(false);
      setUploadForm({
        input: '',
        inputType: null,
        title: '',
        owningTeam: '',
        docType: '',
        confidentiality: '',
        audience: '',
        lifecycle: 'draft',
        system: '',
        tags: ''
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    }
  };

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
    if (!showUpload && !showCreate && !showBrowse && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showUpload, showCreate, showBrowse]);

  const handleBrowseByTeam = async (team) => {
    setSelectedTeam(team);
    setShowBrowse(true);
    try {
      const response = await fetch(`http://localhost:3001/api/documents/browse/team/${team}`);
      if (!response.ok) {
        throw new Error('Failed to fetch team documents');
      }
      const data = await response.json();
      setBrowseResults(data.documents || []);
    } catch (error) {
      console.error('Browse error:', error);
      setBrowseResults([]);
    }
  };

  const handleDocumentClick = (doc) => {
    setSelectedDoc(doc);
    setViewerAction('prompt');
  };

  const openDocument = (action) => {
    if (action === 'new-tab') {
      if (selectedDoc.url) {
        window.open(selectedDoc.url, '_blank');
      } else {
        const blob = new Blob([selectedDoc.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
      setViewerAction(null);
      setSelectedDoc(null);
    } else {
      setViewerAction('inline');
    }
  };

  const DocumentViewer = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {viewerAction === 'prompt' ? (
        <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700">
          <h3 className="text-white font-medium mb-4">{selectedDoc.title}</h3>
          <div className="space-y-2">
            <button
              onClick={() => openDocument('inline')}
              className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center justify-between group transition-colors"
            >
              <span>Open here</span>
              <Eye className="w-4 h-4 opacity-60 group-hover:opacity-100" />
            </button>
            <button
              onClick={() => openDocument('new-tab')}
              className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center justify-between group transition-colors"
            >
              <span>Open in new tab</span>
              <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100" />
            </button>
            <button
              onClick={() => {setViewerAction(null); setSelectedDoc(null);}}
              className="w-full px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <h3 className="text-white font-medium">{selectedDoc.title}</h3>
              <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">
                {selectedDoc.docType}
              </span>
            </div>
            <button
              onClick={() => {setViewerAction(null); setSelectedDoc(null);}}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <pre className="text-slate-300 whitespace-pre-wrap font-mono text-sm">
              {selectedDoc.content}
            </pre>
          </div>
          <div className="p-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>Owner: {selectedDoc.owner}</span>
              <span>Team: {selectedDoc.owningTeam}</span>
              {selectedDoc.nextReview && (
                <span className="text-orange-400">Review: {selectedDoc.nextReview}</span>
              )}
            </div>
            <button
              onClick={() => openDocument('new-tab')}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Open in new tab
            </button>
          </div>
        </div>
      )}
    </div>
  );







  const BrowseModal = () => {
    const teams = ['qa', 'dev', 'ba', 'sa', 'payments', 'platform'];
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] border border-slate-700 flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">Browse by Group</h2>
              <button
                onClick={() => setShowBrowse(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            {!selectedTeam ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {teams.map(team => (
                  <button
                    key={team}
                    onClick={() => handleBrowseByTeam(team)}
                    className="p-6 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-center transition-colors"
                  >
                    <div className="text-2xl font-bold mb-2">{team.toUpperCase()}</div>
                    <div className="text-sm text-slate-400">Click to browse documents</div>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => {
                      setSelectedTeam('');
                      setBrowseResults([]);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back to Teams
                  </button>
                  <h3 className="text-white font-medium">{selectedTeam.toUpperCase()} Documents</h3>
                </div>
                
                {browseResults.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No documents found for {selectedTeam}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {browseResults.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          handleDocumentClick(doc);
                          setShowBrowse(false);
                        }}
                        className="group p-4 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                {doc.title}
                              </h3>
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
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {doc.owningTeam}
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
            )}
          </div>
        </div>
      </div>
    );
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
            {!hasSearched && (
              <div className="flex justify-center mt-4 space-x-3">
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors flex items-center gap-2 border border-slate-700"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors flex items-center gap-2 border border-slate-700"
                >
                  <FileText className="w-4 h-4" />
                  Create
                </button>
                <button
                  onClick={() => setShowBrowse(true)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors flex items-center gap-2 border border-slate-700"
                >
                  <Users className="w-4 h-4" />
                  Browse by Group
                </button>
              </div>
            )}
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
                    // Clear search to show document viewer cleanly
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
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {doc.owningTeam}
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
              
              <div className="flex justify-center pt-4 space-x-3">
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-4 py-2 text-slate-500 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Upload className="w-3 h-3" />
                  Upload
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-4 py-2 text-slate-500 hover:text-white transition-colors flex items-center gap-2"
                >
                  <FileText className="w-3 h-3" />
                  Create
                </button>
                <button
                  onClick={() => setShowBrowse(true)}
                  className="px-4 py-2 text-slate-500 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Users className="w-3 h-3" />
                  Browse by Group
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUpload && <UploadModal 
        uploadForm={uploadForm}
        setUploadForm={setUploadForm}
        uploadErrors={uploadErrors}
        setShowUpload={setShowUpload}
        handleUpload={handleUpload}
        isSaving={isSaving}
      />}
      {showCreate && <CreateModal 
        createForm={createForm}
        setCreateForm={setCreateForm}
        createErrors={createErrors}
        setCreateErrors={setCreateErrors}
        setShowCreate={setShowCreate}
        isSaving={isSaving}
        searchQuery={searchQuery}
        performSearch={performSearch}
      />}
      {showBrowse && <BrowseModal />}
      {viewerAction && selectedDoc && <DocumentViewer />}
    </div>
  );
}