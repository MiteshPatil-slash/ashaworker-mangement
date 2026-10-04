import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Phone, Navigation, Clock } from 'lucide-react';
import L from 'leaflet';

// Fix default leaflet marker icon in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function FacilityMap({ facilities = [] }) {
  const defaultCenter = [19.9615, 79.2961]; // Chandrapur coords

  return (
    <div className="h-80 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer
        center={facilities.length > 0 && facilities[0].coordinates?.lat ? [facilities[0].coordinates.lat, facilities[0].coordinates.lng] : defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {facilities.map((fac) => {
          const lat = fac.coordinates?.lat || defaultCenter[0];
          const lng = fac.coordinates?.lng || defaultCenter[1];

          return (
            <Marker key={fac._id || fac.id} position={[lat, lng]}>
              <Popup>
                <div className="p-1 max-w-[200px]">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                    {fac.type}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 leading-tight">{fac.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{fac.address}</p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
                    <a
                      href={`tel:${fac.contactNumber}`}
                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{fac.contactNumber}</span>
                    </a>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{fac.operatingHours}</span>
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
