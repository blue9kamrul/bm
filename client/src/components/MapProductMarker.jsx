import L from "leaflet";

export const createProductIcon = (imgUrl, name) =>
  L.divIcon({
    html: `
      <div style="
        display: flex; flex-direction: column; align-items: center;
      ">
        <img
          src='${imgUrl}'
          style="
            width: 45px;
            height: 45px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #3b82f6;
            box-shadow: 0 0 6px rgba(0,0,0,0.3);
          "
        />
        <span style="
          background: rgba(0,0,0,0.6);
          color: white;
          font-size: 10px;
          padding: 1px 4px;
          border-radius: 4px;
          margin-top: 2px;
        ">
          ${name.length > 12 ? name.slice(0, 12) + "…" : name}
        </span>
      </div>
    `,
    className: "",
    iconSize: [50, 55],
    iconAnchor: [20, 50],
  });
