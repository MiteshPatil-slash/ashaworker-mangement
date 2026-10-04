import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Eye,
  Check,
  X,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  Building
} from 'lucide-react';

export default function DocumentReviewPage() {
  const { documents, refreshDocuments, approveDocument, requestDocumentCorrection } = useData();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedDoc, setSelectedDoc] = useState(documents[0] || null);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('Official Medical Officer signature or clinic stamp is unclear. Please re-upload verified copy.');

  // Pull the latest uploads from the database when this page opens
  useEffect(() => { refreshDocuments?.(); }, []);

  // Select the first document once the list loads
  useEffect(() => {
    if (!selectedDoc && documents.length > 0) setSelectedDoc(documents[0]);
  }, [documents, selectedDoc]);

  const counts = {
    Pending: documents.filter(d => d.status === 'Pending').length,
    Approved: documents.filter(d => d.status === 'Approved').length,
    NeedsCorrection: documents.filter(d => d.status === 'Needs Correction').length
  };

  const tabs = [
    { key: 'Pending', label: `Pending (${counts.Pending})` },
    { key: 'Approved', label: `Approved (${counts.Approved})` },
    { key: 'Needs Correction', label: `Needs Correction (${counts.NeedsCorrection})` }
  ];

  const filteredDocs = documents.filter(d => {
    if (activeTab === 'Pending') return d.status === 'Pending';
    if (activeTab === 'Approved') return d.status === 'Approved';
    if (activeTab === 'Needs Correction') return d.status === 'Needs Correction';
    return true;
  });

  const handleApprove = (docId) => {
    approveDocument(docId);
    if (selectedDoc?.id === docId) {
      setSelectedDoc(prev => ({ ...prev, status: 'Approved' }));
    }
  };

  const handleConfirmCorrection = () => {
    if (selectedDoc) {
      requestDocumentCorrection(selectedDoc.id, correctionReason);
      setSelectedDoc(prev => ({ ...prev, status: 'Needs Correction', correctionReason }));
      setIsCorrectionModalOpen(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Needs Correction':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Title matching Screen 18 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Document Review (Supervisor)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Verify supporting clinical documentation linked to patient visits and health issues
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{counts.Pending} Documents Awaiting Action</span>
          </span>
        </div>
      </div>

      {/* Tabs matching Screen 18 */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Document List on Left & Preview/Review Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of Documents (Left Column) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Visit</th>
                  <th className="py-3 px-4">File</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No documents found under "{activeTab}" tab.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                        selectedDoc?.id === doc.id ? 'bg-blue-50/70 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">{doc.beneficiaryName}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{doc.visitDate}</td>
                      <td className="py-3.5 px-4 text-blue-700 font-semibold flex items-center gap-1.5 mt-1">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[120px]">{doc.fileName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{doc.uploadedBy}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(doc.status)}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 bg-slate-50/50">
            Click any row to load full document details and clinical validation controls.
          </div>
        </div>

        {/* Right Side: Document Preview & Action Panel matching Screen 18 */}
        <div className="lg:col-span-5">
          {selectedDoc ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">File Preview</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{selectedDoc.fileName}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedDoc.status)}`}>
                  {selectedDoc.status}
                </span>
              </div>

              {/* Visual Preview Snapshot matching Screen 18 preview image */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-52 flex items-center justify-center relative group">
                {selectedDoc.previewUrl ? (
                  <img
                    src={selectedDoc.previewUrl}
                    alt={selectedDoc.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-slate-400" />
                )}
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-bold">
                  {selectedDoc.fileType} • {selectedDoc.fileSize}
                </div>
              </div>

              {/* Connected Details Block: Patient -> Visit -> Issue -> Supporting Document */}
              <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Beneficiary:</span>
                  <strong className="text-slate-900 font-bold">{selectedDoc.beneficiaryName} ({selectedDoc.beneficiaryId})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Visit Date:</span>
                  <strong className="text-slate-900 font-bold">{selectedDoc.visitDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Linked Health Issue:</span>
                  <strong className="text-rose-700 font-bold">{selectedDoc.healthIssue}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Uploaded By:</span>
                  <span className="text-slate-700 font-medium">{selectedDoc.uploadedBy} on {selectedDoc.uploadedOn}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">Description:</span>
                  <p className="text-slate-700 leading-relaxed">{selectedDoc.description}</p>
                </div>

                {selectedDoc.status === 'Needs Correction' && selectedDoc.correctionReason && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-semibold">
                    Correction Note: {selectedDoc.correctionReason}
                  </div>
                )}
              </div>

              {/* Action Buttons strictly matching Screen 18: Approve (green) or Request Correction (amber/red) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleApprove(selectedDoc.id)}
                  disabled={selectedDoc.status === 'Approved'}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedDoc.status === 'Approved'
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{selectedDoc.status === 'Approved' ? 'Approved' : 'Approve'}</span>
                </button>

                <button
                  onClick={() => setIsCorrectionModalOpen(true)}
                  className="py-3 px-4 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Request Correction</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Select a document to review.
            </div>
          )}
        </div>
      </div>

      {/* Request Correction Modal with Reason Input matching Prompt */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Request Document Correction</span>
              </div>
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Enter the reason for requesting correction. The ASHA Worker will receive an immediate notification and can re-upload the verified document.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correction Reason *
              </label>
              <textarea
                rows={3}
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="e.g. Doctor stamp missing or prescription date unclear..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCorrection}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Send Request to Worker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
