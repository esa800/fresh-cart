import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Phone, Mail } from 'lucide-react';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-6">
        {/* Controls bar (Hidden during print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold text-slate-600">Order Invoice / Packing Slip</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-invoice" className="p-6 sm:p-8 bg-white space-y-6 text-slate-800">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-[#f85606] text-white flex items-center justify-center font-bold text-sm">
                  KG
                </div>
                <h1 className="text-2xl font-black text-slate-900">KHAN GADGET <span className="text-[#f85606]">BD</span></h1>
              </div>
              <p className="text-xs text-slate-500">Premium Bangladeshi Gadgets & Mobile Accessories Marketplace</p>
              <p className="text-[11px] text-slate-400">Sector 7, Uttara, Dhaka 1230 • 01854774406</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Invoice Number</span>
              <span className="text-base font-extrabold text-slate-900 block">{order.orderNumber}</span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Date: {new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                Payment: {order.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Billing & Shipping Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">Billed To:</h4>
              <p className="font-semibold text-slate-800">{order.customerName}</p>
              <p className="text-slate-500">{order.phone}</p>
              <p className="text-slate-500">{order.email}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">Delivery Details:</h4>
              <p className="text-slate-700 leading-relaxed">{order.address.fullAddress}</p>
              <p className="text-slate-500">{order.address.area}, {order.address.district}, {order.address.division}</p>
              <p className="text-emerald-700 font-semibold mt-1">
                Speed: {order.deliveryOption === 'express' ? '2-Hour Express' : 'Standard Delivery'}
              </p>
              {order.address.deliveryNote && (
                <p className="text-slate-500 italic mt-0.5">Note: "{order.address.deliveryNote}"</p>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500">
                      {item.unit}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      ৳{item.price}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ৳{item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-slate-200 pt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">৳{order.subtotal}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span className="font-bold">-৳{order.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900">
                  {order.deliveryCharge === 0 ? 'FREE' : `৳${order.deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-base text-emerald-700">৳{order.total}</span>
              </div>
            </div>
          </div>

          {/* Payment Method & Courier Details */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-slate-500 font-medium">Payment Mode: </span>
              <strong className="text-slate-900 uppercase">{order.paymentMethod}</strong>
              {order.paymentDetails?.transactionId && (
                <span className="text-slate-600 ml-2">(TrxID: {order.paymentDetails.transactionId})</span>
              )}
              {order.courierService && (
                <div className="mt-1 text-slate-700">
                  <span className="font-semibold text-slate-900">Courier Partner: </span>
                  <span>{order.courierService}</span>
                  {order.courierTrackingId && (
                    <span className="ml-1 text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Tracking #{order.courierTrackingId}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>Status: {order.orderStatus}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
            <p>Thank you for shopping with KHAN GADGET BD! For queries, contact info@khangadgetbd.com or call 01854774406.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
