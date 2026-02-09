import React, { useState, useEffect, useCallback } from "react";
import { whatsappAPI } from "../services/api";
import "./WhatsAppQRModal.css";

const WhatsAppQRModal = ({ onClose, onAuthenticated }) => {
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState("loading");
  const [clientInfo, setClientInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      const response = await whatsappAPI.getStatus();
      const data = response.data;

      setStatus(data.status);
      
      if (data.isReady && data.clientInfo) {
        setClientInfo(data.clientInfo);
        setLoading(false);
        
        // Auto-close after successful authentication
        if (onAuthenticated) {
          onAuthenticated(data.clientInfo);
        }
        
        setTimeout(() => {
          onClose();
        }, 2000);
        
        return;
      }

      if (data.qrCodeImage) {
        setQrCode(data.qrCodeImage);
        setStatus("qr_available");
        setLoading(false);
      } else if (data.status === "loading" || data.status === "initializing") {
        setLoading(true);
      }

      setError(null);
    } catch (err) {
      console.error("Error checking WhatsApp status:", err);
      setError("Failed to connect to WhatsApp service");
      setLoading(false);
    }
  }, [onClose, onAuthenticated]);

  useEffect(() => {
    checkStatus();

    // Poll for status updates
    const interval = setInterval(() => {
      if (status !== "ready") {
        checkStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status, checkStatus]);

  const handleRestart = async () => {
    try {
      setLoading(true);
      setError(null);
      setQrCode(null);
      
      await whatsappAPI.restart();
      
      // Wait a bit and check status again
      setTimeout(() => {
        checkStatus();
      }, 2000);
    } catch (err) {
      console.error("Error restarting WhatsApp:", err);
      setError("Failed to restart WhatsApp service");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h2>Connect WhatsApp</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="qr-modal-body">
          {loading && (
            <div className="qr-loading">
              <div className="spinner"></div>
              <p>Initializing WhatsApp service...</p>
            </div>
          )}

          {error && (
            <div className="qr-error">
              <p>{error}</p>
              <button onClick={handleRestart} className="retry-btn">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && status === "qr_available" && qrCode && (
            <div className="qr-code-container">
              <h3>Scan the QR Code</h3>
              <p className="qr-instructions">
                1. Open WhatsApp on your phone<br />
                2. Tap Menu or Settings → Linked Devices<br />
                3. Tap "Link a Device"<br />
                4. Point your phone at this screen
              </p>
              <div className="qr-code-wrapper">
                <img src={qrCode} alt="WhatsApp QR Code" />
              </div>
              <p className="qr-status">Waiting for QR scan...</p>
            </div>
          )}

          {!loading && !error && status === "ready" && clientInfo && (
            <div className="qr-success">
              <div className="success-icon">✓</div>
              <h3>WhatsApp Connected!</h3>
              <p className="client-name">{clientInfo.name}</p>
              <p className="client-phone">{clientInfo.phone}</p>
              <p className="auto-close">Closing automatically...</p>
            </div>
          )}

          {!loading && !error && status === "initializing" && (
            <div className="qr-loading">
              <div className="spinner"></div>
              <p>Initializing WhatsApp service...</p>
            </div>
          )}
        </div>

        <div className="qr-modal-footer">
          <button onClick={onClose} className="cancel-btn">
            Close
          </button>
          {status !== "ready" && (
            <button onClick={handleRestart} className="restart-btn">
              Restart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppQRModal;
