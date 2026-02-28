import React, { useCallback, useRef, useState } from "react";
import {
  StyleSheet,
  View as RNView,
  type GestureResponderEvent,
} from "react-native";
import { Image } from "expo-image";
import Svg, {
  Line,
  Polygon,
  Ellipse,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { showToast } from "@/store/toast-store";

// ── Types ──

export type AnnotationTool = "arrow" | "circle" | "text";

export interface ArrowAnnotation {
  id: string;
  type: "arrow";
  color: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface CircleAnnotation {
  id: string;
  type: "circle";
  color: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface TextAnnotation {
  id: string;
  type: "text";
  color: string;
  x: number;
  y: number;
  text: string;
}

export type Annotation = ArrowAnnotation | CircleAnnotation | TextAnnotation;

// ── Props ──

interface AnnotationCanvasProps {
  photoUri: string;
  annotations: Annotation[];
  activeTool: AnnotationTool;
  activeColor: string;
  onAnnotationAdd: (annotation: Annotation) => void;
  onTextRequest: (x: number, y: number) => void;
  canvasRef: React.RefObject<RNView | null>;
}

// ── Constants ──

const MAX_ANNOTATIONS = 20;
const ARROWHEAD_LENGTH = 15;
const MIN_DRAW_DISTANCE = 10;

let annotationCounter = 0;

function generateAnnotationId(): string {
  return `anno_${Date.now()}_${++annotationCounter}`;
}

// ── Arrow Rendering Helpers ──

function calculateArrowheadPoints(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): string {
  const angle = Math.atan2(endY - startY, endX - startX);
  const point1X = endX - ARROWHEAD_LENGTH * Math.cos(angle - Math.PI / 6);
  const point1Y = endY - ARROWHEAD_LENGTH * Math.sin(angle - Math.PI / 6);
  const point2X = endX - ARROWHEAD_LENGTH * Math.cos(angle + Math.PI / 6);
  const point2Y = endY - ARROWHEAD_LENGTH * Math.sin(angle + Math.PI / 6);
  return `${endX},${endY} ${point1X},${point1Y} ${point2X},${point2Y}`;
}

// ── Individual Annotation Renderers ──

function RenderArrow({ annotation }: { annotation: ArrowAnnotation }) {
  const headPoints = calculateArrowheadPoints(
    annotation.startX,
    annotation.startY,
    annotation.endX,
    annotation.endY
  );

  return (
    <>
      <Line
        x1={annotation.startX}
        y1={annotation.startY}
        x2={annotation.endX}
        y2={annotation.endY}
        stroke={annotation.color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Polygon points={headPoints} fill={annotation.color} />
    </>
  );
}

function RenderCircle({ annotation }: { annotation: CircleAnnotation }) {
  return (
    <Ellipse
      cx={annotation.cx}
      cy={annotation.cy}
      rx={annotation.rx}
      ry={annotation.ry}
      stroke={annotation.color}
      strokeWidth={3}
      fill="none"
    />
  );
}

function RenderText({ annotation }: { annotation: TextAnnotation }) {
  // Estimate text width for background rect
  const charWidth = 9;
  const padding = 8;
  const textWidth = annotation.text.length * charWidth + padding * 2;
  const textHeight = 24;

  return (
    <>
      <Rect
        x={annotation.x - padding}
        y={annotation.y - textHeight + 4}
        width={textWidth}
        height={textHeight}
        rx={4}
        ry={4}
        fill="rgba(0, 0, 0, 0.6)"
      />
      <SvgText
        x={annotation.x}
        y={annotation.y}
        fill={annotation.color}
        fontSize={14}
        fontWeight="bold"
      >
        {annotation.text}
      </SvgText>
    </>
  );
}

function RenderAnnotation({ annotation }: { annotation: Annotation }) {
  switch (annotation.type) {
    case "arrow":
      return <RenderArrow annotation={annotation} />;
    case "circle":
      return <RenderCircle annotation={annotation} />;
    case "text":
      return <RenderText annotation={annotation} />;
  }
}

// ── Active Drawing Preview ──

interface DrawingPreview {
  tool: "arrow" | "circle";
  color: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

function RenderPreview({ preview }: { preview: DrawingPreview }) {
  if (preview.tool === "arrow") {
    const headPoints = calculateArrowheadPoints(
      preview.startX,
      preview.startY,
      preview.currentX,
      preview.currentY
    );
    return (
      <>
        <Line
          x1={preview.startX}
          y1={preview.startY}
          x2={preview.currentX}
          y2={preview.currentY}
          stroke={preview.color}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.7}
        />
        <Polygon points={headPoints} fill={preview.color} opacity={0.7} />
      </>
    );
  }

  // Circle preview
  const rx = Math.abs(preview.currentX - preview.startX);
  const ry = Math.abs(preview.currentY - preview.startY);
  return (
    <Ellipse
      cx={preview.startX}
      cy={preview.startY}
      rx={rx}
      ry={ry}
      stroke={preview.color}
      strokeWidth={3}
      fill="none"
      opacity={0.7}
    />
  );
}

// ── Main Component ──

export function AnnotationCanvas({
  photoUri,
  annotations,
  activeTool,
  activeColor,
  onAnnotationAdd,
  onTextRequest,
  canvasRef,
}: AnnotationCanvasProps) {
  const [drawingPreview, setDrawingPreview] = useState<DrawingPreview | null>(
    null
  );
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const getLocationInView = useCallback(
    (event: GestureResponderEvent): { x: number; y: number } => {
      return {
        x: event.nativeEvent.locationX,
        y: event.nativeEvent.locationY,
      };
    },
    []
  );

  const handleTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      if (annotations.length >= MAX_ANNOTATIONS) {
        showToast("warning", "Maximum annotations reached");
        return;
      }

      const location = getLocationInView(event);
      touchStartRef.current = location;

      if (activeTool === "text") {
        // Text tool: trigger text input on tap
        onTextRequest(location.x, location.y);
        return;
      }

      // Arrow or circle: start drawing preview
      setDrawingPreview({
        tool: activeTool,
        color: activeColor,
        startX: location.x,
        startY: location.y,
        currentX: location.x,
        currentY: location.y,
      });
    },
    [activeTool, activeColor, annotations.length, getLocationInView, onTextRequest]
  );

  const handleTouchMove = useCallback(
    (event: GestureResponderEvent) => {
      if (!drawingPreview) return;

      const location = getLocationInView(event);
      setDrawingPreview((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentX: location.x,
          currentY: location.y,
        };
      });
    },
    [drawingPreview, getLocationInView]
  );

  const handleTouchEnd = useCallback(
    (event: GestureResponderEvent) => {
      if (!drawingPreview || !touchStartRef.current) {
        setDrawingPreview(null);
        touchStartRef.current = null;
        return;
      }

      const location = getLocationInView(event);
      const dx = location.x - drawingPreview.startX;
      const dy = location.y - drawingPreview.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only commit if the gesture was long enough
      if (distance >= MIN_DRAW_DISTANCE) {
        const id = generateAnnotationId();

        if (drawingPreview.tool === "arrow") {
          const arrow: ArrowAnnotation = {
            id,
            type: "arrow" as const,
            color: drawingPreview.color,
            startX: drawingPreview.startX,
            startY: drawingPreview.startY,
            endX: location.x,
            endY: location.y,
          };
          onAnnotationAdd(arrow);
        } else {
          const circle: CircleAnnotation = {
            id,
            type: "circle" as const,
            color: drawingPreview.color,
            cx: drawingPreview.startX,
            cy: drawingPreview.startY,
            rx: Math.abs(dx),
            ry: Math.abs(dy),
          };
          onAnnotationAdd(circle);
        }
      }

      setDrawingPreview(null);
      touchStartRef.current = null;
    },
    [drawingPreview, getLocationInView, onAnnotationAdd]
  );

  return (
    <RNView
      ref={canvasRef}
      style={styles.canvas}
      collapsable={false}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handleTouchStart}
      onResponderMove={handleTouchMove}
      onResponderRelease={handleTouchEnd}
    >
      {/* Photo background */}
      <Image
        source={{ uri: photoUri }}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        cachePolicy="memory"
      />

      {/* SVG overlay for annotations */}
      <Svg style={StyleSheet.absoluteFill}>
        {/* Committed annotations */}
        {annotations.map((annotation) => (
          <RenderAnnotation key={annotation.id} annotation={annotation} />
        ))}

        {/* Active drawing preview */}
        {drawingPreview ? <RenderPreview preview={drawingPreview} /> : null}
      </Svg>
    </RNView>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
