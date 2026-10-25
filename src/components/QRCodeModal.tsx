import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Contact } from '../types/contact';
import { contactToVCard } from '../utils/vcard';
import { formatFullName, getInitials } from '../utils/helpers';
import { X, Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';

interface QRCodeModalProps {
  contact: Contact;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ contact, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullName = formatFullName(contact);
  const vcardText = contactToVCard(contact);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        vcardText,
        {
          width: 256,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        },
        (err) => {
          if (err) {
            console.error('QR code generation failed:', err);
            setError('Could not generate QR code for this contact.');
          }
        }
      );
    }
  }, [vcardText]);

  const handleCopyVCard = async () => {
    try {
      await navigator.clipboard.writeText(vcardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadVCF = () => {
    const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contact.firstName || 'contact'}_${contact.lastName || 'card'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <QrIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Share Contact Card</h3>
              <p className="text-xs text-slate-500">Scan with your phone camera to save</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Contact pill preview */}
          <div className="flex items-center gap-3 mb-5 p-2 pr-4 bg-slate-50 rounded-xl border border-slate-100 max-w-full">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-xs"
              style={{ backgroundColor: contact.avatarColor }}
            >
              {getInitials(contact.firstName, contact.lastName)}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{fullName}</p>
              <p className="text-xs text-slate-500 truncate">
                {contact.jobTitle ? `${contact.jobTitle}${contact.company ? ` · ${contact.company}` : ''}` : (contact.company || contact.phones[0]?.number || 'No company')}
              </p>
            </div>
          </div>

          {/* QR Canvas Container */}
          <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/70 inline-block mb-4">
            {error ? (
              <div className="w-64 h-64 flex items-center justify-center text-rose-500 text-sm">
                {error}
              </div>
            ) : (
              <canvas ref={canvasRef} className="rounded-lg max-w-full h-auto" />
            )}
          </div>

          <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
            Standard vCard 3.0 format supported by iOS Camera, Android Google Lens, and all modern mobile devices.
          </p>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={handleCopyVCard}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied vCard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy vCard</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadVCF}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download .vcf</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
