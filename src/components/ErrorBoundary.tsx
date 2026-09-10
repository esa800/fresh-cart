import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('KHAN store error caught:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-xl border border-slate-100 text-center">
            <div className="w-14 h-14 bg-amber-100 text-[#f85606] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h1 className="text-lg font-black text-slate-900 mb-2">
              পেজ লোড হতে সাময়িক সমস্যা হয়েছে
            </h1>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              দয়া করে নিচের বাটনে ক্লিক করে পেজটি আবার রিলোড করুন।
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-[#f85606] hover:bg-[#e04a00] text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-98 cursor-pointer"
            >
              পেজ রিফ্রেশ করুন (Refresh Page)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
