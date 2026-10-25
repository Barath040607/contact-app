import React, { useState, useEffect, useRef } from 'react';
import { Contact } from '../types/contact';
import { formatFullName, formatPhoneNumber, getInitials } from '../utils/helpers';
import { Phone, PhoneOff, Delete, UserPlus, X, Mic, MicOff, Volume2, Clock } from 'lucide-react';

interface DialerModalProps {
  contacts: Contact[];
  onClose: () => void;
  onSelectContact: (contact: Contact) => void;
  onCreateContactWithNumber: (num: string) => void;
  onLogInteraction: (contactId: string, summary: string, duration?: string) => void;
}

const KEYPAD_KEYS = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' },
  { digit: '0', letters: '+' },
  { digit: '#', letters: '' },
];

export const DialerModal: React.FC<DialerModalProps> = ({
  contacts,
  onClose,
  onSelectContact,
  onCreateContactWithNumber,
  onLogInteraction,
}) => {
  const [inputNumber, setInputNumber] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play subtle DTMF tone
  const playTone = (digit: string) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      const freqs: Record<string, number> = {
        '1': 697, '2': 697, '3': 697,
        '4': 770, '5': 770, '6': 770,
        '7': 852, '8': 852, '9': 852,
        '*': 941, '0': 941, '#': 941,
      };
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqs[digit] || 700, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio might be blocked by browser policy without user gesture
    }
  };

  const handleDigit = (digit: string) => {
    playTone(digit);
    setInputNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setInputNumber((prev) => prev.slice(0, -1));
  };

  // Find matching contact
  const cleanInput = inputNumber.replace(/\D/g, '');
  const matchedContact = cleanInput.length >= 3
    ? contacts.find((c) =>
        c.phones.some((p) => p.number.replace(/\D/g, '').includes(cleanInput))
      )
    : null;

  // In-call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInCall) {
      timer = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isInCall]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    if (!inputNumber) return;
    setIsInCall(true);
    setCallDuration(0);
  };

  const endCall = () => {
    setIsInCall(false);
    if (callDuration > 0 && matchedContact) {
      const mins = Math.floor(callDuration / 60);
      const secs = callDuration % 60;
      const durationStr = `${mins}m ${secs}s`;
      onLogInteraction(
        matchedContact.id,
        `Outbound call to ${formatPhoneNumber(inputNumber)}`,
        durationStr
      );
    }
    setCallDuration(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {isInCall ? 'Active Call' : 'Keypad & Dialer'}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isInCall ? (
          /* In-Call Screen */
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg ring-8 ring-slate-100">
              {matchedContact
                ? getInitials(matchedContact.firstName, matchedContact.lastName)
                : <Phone className="w-8 h-8 text-emerald-400" />}
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-1">
              {matchedContact ? formatFullName(matchedContact) : formatPhoneNumber(inputNumber)}
            </h3>

            <p className="text-xs text-slate-500 mb-3 font-mono">
              {matchedContact ? formatPhoneNumber(inputNumber) : 'Direct Outbound'}
            </p>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full mb-8 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(callDuration)}</span>
            </div>

            {/* In-Call Controls */}
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border transition-colors ${
                  isMuted ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span className="text-xs font-medium">{isMuted ? 'Muted' : 'Mute'}</span>
              </button>

              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border transition-colors ${
                  isSpeaker ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-xs font-medium">{isSpeaker ? 'Speaker On' : 'Speaker'}</span>
              </button>
            </div>

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
              title="End Call"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        ) : (
          /* Normal Keypad Screen */
          <div className="px-6 pb-6 flex flex-col items-center">
            {/* Display screen */}
            <div className="w-full text-center py-4 min-h-[90px] flex flex-col items-center justify-center">
              <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono select-all truncate max-w-full px-2">
                {inputNumber ? formatPhoneNumber(inputNumber) : <span className="text-slate-300">Enter number</span>}
              </div>

              {/* Matched contact shortcut */}
              {matchedContact && (
                <button
                  onClick={() => {
                    onSelectContact(matchedContact);
                    onClose();
                  }}
                  className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                >
                  <span>{formatFullName(matchedContact)}</span>
                  <span className="text-slate-400">· View Dossier</span>
                </button>
              )}

              {inputNumber && !matchedContact && cleanInput.length >= 7 && (
                <button
                  onClick={() => {
                    onCreateContactWithNumber(inputNumber);
                    onClose();
                  }}
                  className="mt-1 text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create new contact</span>
                </button>
              )}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] my-2">
              {KEYPAD_KEYS.map((k) => (
                <button
                  key={k.digit}
                  onClick={() => handleDigit(k.digit)}
                  className="w-16 h-16 mx-auto rounded-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/60 flex flex-col items-center justify-center transition-all select-none group"
                >
                  <span className="text-xl font-semibold text-slate-900 group-hover:scale-105 transition-transform leading-none font-mono">
                    {k.digit}
                  </span>
                  {k.letters && (
                    <span className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5 leading-none">
                      {k.letters}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bottom Row Actions */}
            <div className="grid grid-cols-3 items-center w-full max-w-[280px] mt-4">
              <div />
              {/* Call button */}
              <button
                onClick={startCall}
                disabled={!inputNumber}
                className="w-16 h-16 mx-auto rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95"
                title="Dial"
              >
                <Phone className="w-6 h-6" />
              </button>

              {/* Backspace */}
              {inputNumber ? (
                <button
                  onClick={handleBackspace}
                  className="p-3 mx-auto text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                  title="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
