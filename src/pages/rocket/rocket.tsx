import { useCallback, useState } from "react";
import Box from "../../components/box/box";
import spaceBg from "../../../assets/space_bg.jpg";
import { cellNumberFromAxial, HexMapPopup, type HexMapObjectItem } from "../../components/hex-map/HexMap";
import { Button } from "../../components/button/Button";

const initialObjects = (): HexMapObjectItem[] => {
  const planet = cellNumberFromAxial(0, 0);
  const wreck = cellNumberFromAxial(3, -2);
  const out: HexMapObjectItem[] = [];
  if (planet != null) out.push({ cellNumber: planet, name: "Demo planet", type: "planet", main: true });
  if (wreck != null) out.push({ cellNumber: wreck, name: "Demo wreck", type: "wreck" });
  return out;
};

export default function Rocket() {
  const [objects, setObjects] = useState<HexMapObjectItem[]>(initialObjects);

  const onCreateObject = useCallback((item: HexMapObjectItem) => {
    setObjects((prev) => {
      if (prev.some((o) => o.cellNumber === item.cellNumber)) return prev;
      return [...prev, item];
    });
  }, []);

  const onHexClick = useCallback((cellNumber: number, q: number, r: number) => {
    console.log("hex cell #", cellNumber, { q, r });
  }, []);

  const onDeleteObject = useCallback((cellNumber: number) => {
    setObjects((prev) => prev.filter((o) => o.cellNumber !== cellNumber));
  }, []);

  const onUpdateObject = useCallback((item: HexMapObjectItem) => {
    setObjects((prev) =>
      prev.map((o) => (o.cellNumber === item.cellNumber ? { ...item } : o))
    );
  }, []);

  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignSelf: "stretch",
        minHeight: 0,
      }}
    >
      <Box
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          boxSizing: "border-box",
          gap: 8,
        }}
      >
        <h2 style={{ margin: 0 }}>Rocket</h2>
        <p style={{ margin: 0, opacity: 0.75, fontSize: 14 }}>
          Колёсико — масштаб к курсору. Сдвиг — ЛКМ или ПКМ. Короткий клик по занятой ячейке — лог в консоль. По
          свободной клетке без соседства с планетой — форма нового объекта (нужен{" "}
          <code style={{ opacity: 0.9 }}>onCreateObject</code> у <code style={{ opacity: 0.9 }}>HexMap</code>).
        </p>
        <Button onClick={() => setOpen(true)}>Open edit</Button>
        <Button onClick={() => setOpen(false)}>Close select</Button>
        <HexMapPopup
          open={open}
          onClose={() => setOpen(false)}
          mapProps={{
            backgroundImageSrc: spaceBg,
            objects: objects,
            onCreateObject: onCreateObject,
            onUpdateObject: onUpdateObject,
            onDeleteObject: onDeleteObject,
            onHexClick: onHexClick,
            minHeightPx: 280,
          }}
        />
      </Box>
    </div>
  );
}
