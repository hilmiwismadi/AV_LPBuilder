import React from "react";

const QRISModal = ({ amount, onClose, onComplete }) => {
  const formatCurrency = (val) => {
    return "Rp " + val.toLocaleString("id-ID");
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-t-2xl sm:rounded-2xl max-w-md w-full p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">
            QRIS Payment
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-medium hover:text-neutral-dark transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR Code Placeholder */}
        <div className="flex justify-center mb-6">
          <div
            className="w-64 h-64 rounded-3xl flex flex-col items-center justify-center border-4 border-dashed border-primary bg-neutral-light"
          >
            <svg className="w-24 h-24 mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className="text-neutral-medium text-sm">Scan QR Code</span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center mb-6">
          <p className="text-neutral-medium mb-1 text-sm">Total Amount</p>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(amount)}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-neutral-light rounded-2xl p-4 mb-6 text-sm text-neutral-medium">
          <ol className="list-decimal list-inside space-y-2">
            <li>Open your e-wallet app (GoPay, OVO, Dana, etc.)</li>
            <li>Scan the QR code above</li>
            <li>Confirm the payment</li>
            <li>Wait for payment confirmation</li>
          </ol>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onComplete}
            className="flex-1 py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all duration-200"
          >
            I Have Paid
          </button>
        </div>

        {/* Timer */}
        <div className="mt-4 text-center text-sm text-neutral-medium">
          Payment expires in <span className="font-semibold text-primary">29:59</span>
        </div>
      </div>
    </div>
  );
};

export default QRISModal;
