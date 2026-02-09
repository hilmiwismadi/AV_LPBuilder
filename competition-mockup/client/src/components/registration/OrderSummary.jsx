import React from "react";

const OrderSummary = ({ event, tickets }) => {
  const calculateTotal = () => {
    if (!event || !tickets) return 0;
    return tickets.reduce((sum, ticket) => {
      const ticketType = event.ticketTypes?.find(t => t.id === ticket.ticketType);
      return sum + (ticketType ? ticketType.price : 0);
    }, 0);
  };

  const total = calculateTotal();

  const getTicketTypeName = (ticketId) => {
    const type = event?.ticketTypes?.find(t => t.id === ticketId);
    return type ? type.name : ticketId;
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
        {/* Event Poster Placeholder */}
        {event?.poster && (
          <div className="mb-5 rounded-xl overflow-hidden bg-gradient-to-br from-primary/15 to-primary/5 h-32 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">Event Poster</span>
          </div>
        )}

        {/* Event Details */}
        <div className="mb-5 pb-5 border-b border-neutral-DEFAULT">
          <h3 className="font-semibold text-base mb-3 text-primary">
            {event?.name || "Event Name"}
          </h3>
          <div className="space-y-2.5 text-xs text-neutral-medium">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{event?.location || "Location"}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{event?.date || "Date"}</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-5">
          <h4 className="font-semibold text-sm text-neutral-dark mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Order Summary
          </h4>

          {tickets && tickets.map((ticket, index) => (
            <div key={index} className="flex justify-between items-center py-2 text-xs">
              <span className="text-neutral-medium">
                Ticket {index + 1}
              </span>
              <span className="font-medium text-primary">
                {getTicketTypeName(ticket.ticketType)}
              </span>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-neutral-DEFAULT">
            <span className="font-bold text-sm text-neutral-dark">Total</span>
            <span className="font-bold text-xl text-primary">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button className="btn-primary">
          Lanjut Pembayaran
        </button>

        {/* Security Note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-medium">
          <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Pembayaran Aman & Terenkripsi</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
