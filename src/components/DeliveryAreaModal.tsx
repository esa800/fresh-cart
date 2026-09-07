import React from 'react';
import { X, MapPin, Check, Truck, Clock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { StoreService } from '../services/store';
import { DeliveryZone } from '../types';

interface DeliveryAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryAreaModal: React.FC<DeliveryAreaModalProps> = ({ isOpen, onClose }) => {
  const { selectedZone, setSelectedZone } = useCart();
  const zones = StoreService.getDeliveryZones();

  if (!isOpen) return null;

  const handleSelectZone = (zone: DeliveryZone) => {
    setSelectedZone(zone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Select Delivery Location</h3>
              <p className="text-xs text-slate-500">Choose your area for accurate delivery fees & timings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zones list */}
        <div className="p-4 max-h-[440px] overflow-y-auto space-y-2.5">
          {zones.map((zone) => {
            const isSelected = selectedZone.id === zone.id;
            return (
              <div
                key={zone.id}
                onClick={() => handleSelectZone(zone)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{zone.name}</span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {zone.division}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {zone.estimatedTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs pt-1">
                    <span className="text-emerald-700 font-bold">Standard: ৳{zone.standardCharge}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-700 font-bold">Express: ৳{zone.expressCharge}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 text-[11px]">Free above ৳{zone.freeDeliveryThreshold}</span>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <Truck className="w-4 h-4" />
            2-Hour Express available in Dhaka North & South!
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
