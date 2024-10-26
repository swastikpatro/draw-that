"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState, MouseEvent } from "react";

type TPoint = {
  x: number;
  y: number;
};

const AVAILABLE_SHAPES = ["path", "rect"] as const;

type TShape = (typeof AVAILABLE_SHAPES)[number];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapes, setShapes] = useState<TPoint[][]>([]);
  const [activePath, setActivePath] = useState<TPoint[]>([]);
  const [activeShapeType, setActiveShapeType] = useState<TShape>(
    AVAILABLE_SHAPES[0]
  );

  const handleMouseDown = ({
    clientX,
    clientY,
  }: MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const newPoint = { x: clientX, y: clientY };
    setActivePath([newPoint]);
  };

  const handleMouseMove = ({
    clientX,
    clientY,
  }: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const newPoint = { x: clientX, y: clientY };
    setActivePath([...activePath, newPoint]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    setShapes(shapes.length > 0 ? [...shapes, activePath] : [activePath]);
    setActivePath([]);
    setIsDrawing(false);
  };

  // Initialize canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set drawing styles
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const whiteStaging = {
      width: canvas.width / 2,
      height: canvas.height / 2,
    };

    ctx.fillStyle = "#fff";
    ctx.fillRect(
      whiteStaging.width / 2,
      whiteStaging.height / 2,
      whiteStaging.width,
      whiteStaging.height
    );

    // Draw all completed shapes
    const allShapes = [...shapes, activePath];
    allShapes.forEach((shape) => {
      if (shape.length < 1) return;

      ctx.beginPath();
      ctx.moveTo(shape[0].x, shape[0].y);
      shape.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });

    return () => ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [shapes, activePath]);
  return (
    <div className="relative font-[family-name:var(--font-geist-sans)] h-screen">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      />

      <div className="bg-white p-2 absolute top-0 left-0 w-fit h-fit">
        <div className="flex gap-2">
          <Select
            onValueChange={(selectedShapeType: TShape) =>
              setActiveShapeType(selectedShapeType)
            }
            defaultValue={activeShapeType}
          >
            <SelectTrigger className="capitalize">
              <SelectValue placeholder="Select Shape" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_SHAPES.map((singleShapeType) => (
                <SelectItem
                  className="capitalize"
                  key={singleShapeType}
                  value={singleShapeType}
                >
                  {singleShapeType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
