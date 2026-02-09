import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProgressBar from "../shared/ProgressBar";
import OrderSummary from "./OrderSummary";
import QRISModal from "./QRISModal";
import api from "../../services/api";

const RegistrationForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [showQRIS, setShowQRIS] = useState(false);

  const [formData, setFormData] = useState({
    buyerName: "",
    buyerNIK: "",
    buyerEmail: "",
    buyerWhatsApp: "",
    tickets: [{ ticketType: "", participantName: "", participantNIK: "", tshirtSize: "" }]
  });

  const steps = ["Pilih Kategori", "Detail Pesanan", "Halaman Pembayaran", "Pembayaran"];

  React.useEffect(() => {
    api.get("/events/public/" + slug)
      .then(res => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading event:", err);
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowQRIS(true);
  };

  const handlePaymentComplete = () => {
    setShowQRIS(false);
    navigate("/event/" + slug + "/confirmation");
  };

  const calculateTotal = () => {
    if (!event) return 0;
    return formData.tickets.reduce((sum, ticket) => {
      const type = event.ticketTypes?.find(t => t.id === ticket.ticketType);
      return sum + (type ? type.price : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary"></div>
          <p className="text-neutral-dark">Loading...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-neutral-dark mb-2">Event Not Found</h1>
          <p className="text-neutral-medium">The event you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Roetix</h1>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden sm:block text-neutral-dark text-sm">{event.location}</span>
              <button className="px-4 py-2 sm:px-5 border-2 border-primary text-primary rounded-full text-xs sm:text-sm font-medium hover:bg-primary hover:text-white transition-all duration-200">
                My Orders
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-neutral-DEFAULT">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <ProgressBar currentStep={currentStep} steps={steps} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-primary shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-neutral-dark mb-1">{event.name}</h2>
                  <p className="text-neutral-medium text-sm">{event.description}</p>
                </div>
              </div>
            </div>

            {/* Registration Form Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Section Header */}
              <div className="mb-6">
                <div className="section-header mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Identitas Pembeli</span>
                </div>
                <p className="text-neutral-medium text-xs ml-1">Lengkapi form di bawah untuk pendaftaran</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-5 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-dark mb-2">Nama Sesuai KTP *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Masukkan Nama Lengkap Anda"
                      value={formData.buyerName}
                      onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-dark mb-2">NIK *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Masukkan Nomor Induk Kependudukan"
                      value={formData.buyerNIK}
                      onChange={(e) => setFormData({...formData, buyerNIK: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-dark mb-2">Nomor WhatsApp *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 bg-neutral-light border border-r-0 border-neutral-DEFAULT rounded-l-2xl text-neutral-dark text-sm font-medium">
                        +62
                      </span>
                      <input
                        type="tel"
                        required
                        className="flex-1 px-4 bg-white border border-neutral-DEFAULT rounded-r-2xl text-sm text-neutral-dark placeholder:text-neutral-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        placeholder="81234567890"
                        value={formData.buyerWhatsApp}
                        onChange={(e) => setFormData({...formData, buyerWhatsApp: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-dark mb-2">T-Shirt Size *</label>
                    <select
                      required
                      className="form-input appearance-none cursor-pointer"
                      value={formData.tickets[0]?.tshirtSize || ""}
                      onChange={(e) => {
                        const newTickets = [...formData.tickets];
                        newTickets[0] = { ...newTickets[0], tshirtSize: e.target.value };
                        setFormData({ ...formData, tickets: newTickets });
                      }}
                    >
                      <option value="">Select an option</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  Beli Sekarang
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary event={event} tickets={formData.tickets} />
          </div>
        </div>
      </main>

      {/* QRIS Modal */}
      {showQRIS && (
        <QRISModal
          amount={calculateTotal()}
          onClose={() => setShowQRIS(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default RegistrationForm;
