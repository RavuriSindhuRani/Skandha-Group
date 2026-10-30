import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  LAYOUT_BOUNDS,
  SITE_BOUNDARY_LOCAL,
  LAYOUT_GRASS_BUFFER_LOCAL,
  layoutRoads,
  parkData,
  statusColors
} from './masterPlanData';

// Road definitions for the interactive Street Walk / Road Travel mode
export const WALK_ROADS = [
  {
    id: 'ROAD-33-MID',
    name: "33' Internal Main Boulevard",
    shortName: "33' Boulevard",
    startX: -82,
    endX: 60,
    z: 0.5,
    axis: 'x',
    cameraHeight: 2.1,
    forwardYaw: Math.PI / 2, // Facing +X (East down the avenue)
    lookAhead: 16
  },
  {
    id: 'ROAD-33-V1',
    name: "33' Vertical Avenue 1 (West)",
    shortName: "Avenue 1",
    x: -32.5,
    startZ: 56,
    endZ: -40,
    axis: 'z',
    cameraHeight: 2.1,
    forwardYaw: 0, // Facing -Z (North toward Maisigandi road)
    lookAhead: 16
  },
  {
    id: 'ROAD-33-V2',
    name: "33' Vertical Avenue 2 (Central)",
    shortName: "Avenue 2",
    x: -3.5,
    startZ: 56,
    endZ: -40,
    axis: 'z',
    cameraHeight: 2.1,
    forwardYaw: 0, // Facing -Z (North)
    lookAhead: 16
  },
  {
    id: 'ROAD-33-V3',
    name: "33' Vertical Avenue 3 (East)",
    shortName: "Avenue 3",
    x: 25.5,
    startZ: 56,
    endZ: -40,
    axis: 'z',
    cameraHeight: 2.1,
    forwardYaw: 0, // Facing -Z (North)
    lookAhead: 16
  },
  {
    id: 'ROAD-60-TOP',
    name: "60' Arterial Road",
    shortName: "60' Arterial",
    startX: -86,
    endX: 70,
    z: -47,
    axis: 'x',
    cameraHeight: 2.3,
    forwardYaw: Math.PI / 2, // Facing +X (East)
    lookAhead: 18
  },
  {
    id: 'ROAD-33-EAST',
    name: "33' East Road",
    shortName: "33' East Road",
    x: 73.5,
    startZ: -50,
    endZ: 60,
    axis: 'z',
    cameraHeight: 2.1,
    forwardYaw: Math.PI, // Facing +Z (Southbound)
    lookAhead: 18
  },
  {
    id: 'ROAD-33-V0',
    name: "33' Avenue 0 (Park Road)",
    shortName: "Avenue 0",
    x: -61.5,
    startZ: 50,
    endZ: -40,
    axis: 'z',
    cameraHeight: 2.1,
    forwardYaw: 0, // Facing -Z (North toward 60ft road)
    lookAhead: 16
  }
];

// Camera Controller for Smooth Transitions, Street Walk, and Park Ground Inspections
function CameraController({
  selectedPlot,
  cameraPreset,
  walkRoadIndex = 0,
  walkProgress = 0,
  onWalkProgressChange,
  onAzimuthChange,
  onResetComplete,
  onExitWalk,
  onSwitchToMapView,
  onSwitchToOverview,
  apiRef
}) {
  const { camera, gl, size } = useThree();
  const controlsRef = useRef();
  const animatingRef = useRef(false);
  const animRate = useRef(1.0); // Slow, continuous gliding walk feel for forward and backward movement
  const targetPos = useRef(new THREE.Vector3(-9, 85, 120));
  const targetLook = useRef(new THREE.Vector3(-9, 0, 6));
  const currentLook = useRef(new THREE.Vector3(-9, 0, 6));
  const defaultTarget = useMemo(() => new THREE.Vector3(-9, 0, 6), []);
  const lastAzimuthRef = useRef(0);
  const wheelOutAccum = useRef(0);
  const prevPresetRef = useRef(cameraPreset);
  const keysPressed = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  // Maintain constant horizontal visibility across screen resize, window minimize, or mobile orientation
  useEffect(() => {
    if (!camera || !camera.isPerspectiveCamera) return;
    const aspect = size.width / Math.max(size.height, 1);
    const baseAspect = 1.777; // 16:9 widescreen baseline
    const baseFov = 42;
    if (aspect < baseAspect) {
      // Widen vertical FOV proportionally so horizontal field of view NEVER zooms in when window is minimized or narrowed
      const hFov = 2 * Math.atan(Math.tan((baseFov * Math.PI) / 360) * baseAspect);
      const newFov = 2 * Math.atan(Math.tan(hFov / 2) / aspect) * (180 / Math.PI);
      camera.fov = Math.min(newFov, 75);
    } else {
      camera.fov = baseFov;
    }
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  // Expose smooth, responsive zoomIn / zoomOut / reset to external toolbars
  React.useImperativeHandle(apiRef, () => ({
    zoomIn: () => {
      if (cameraPreset === 'roadWalk') {
        const nextProg = Math.min(1, progRef.current + 0.04);
        progRef.current = nextProg;
        if (onWalkProgressChange) onWalkProgressChange(nextProg);
        return;
      }
      if (cameraPreset === 'mapView') {
        if (onSwitchToOverview) {
          onSwitchToOverview();
          return;
        }
      }
      if (controlsRef.current) {
        const target = controlsRef.current.target;
        const offset = new THREE.Vector3().subVectors(camera.position, target);
        const dist = offset.length();
        if (dist > 8) {
          // Direct, smooth forward zoom step (22% inward)
          offset.multiplyScalar(0.78);
          camera.position.copy(target).add(offset);
          controlsRef.current.update();
        }
      }
    },
    zoomOut: () => {
      if (cameraPreset === 'roadWalk' || cameraPreset === 'park' || cameraPreset === 'parkGround') {
        if (progRef.current > 0.05) {
          const nextProg = Math.max(0, progRef.current - 0.04);
          progRef.current = nextProg;
          if (onWalkProgressChange) onWalkProgressChange(nextProg);
          return;
        } else if (onExitWalk) {
          onExitWalk();
          return;
        }
      }
      if (controlsRef.current) {
        const target = controlsRef.current.target;
        const offset = new THREE.Vector3().subVectors(camera.position, target);
        const dist = offset.length();
        // User requirement: "can zoom in zoom out manually for like small particle" -> allows full manual zoom out
        if (dist < 2800) {
          // Direct, smooth backward zoom step (28% outward)
          offset.multiplyScalar(1.28);
          camera.position.copy(target).add(offset);
          controlsRef.current.update();
        }
      }
    },
    reset: () => {
      targetPos.current.set(-9, 85, 120);
      targetLook.current.set(-9, 0, 6);
      if (controlsRef.current) {
        currentLook.current.copy(controlsRef.current.target);
      }
      animRate.current = 1.6;
      animatingRef.current = true;
    }
  }));

  // Keyboard navigation for slow continuous forward & backward movement across 3D
  useEffect(() => {
    const handleWindowKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowUp' || e.code === 'KeyW' || e.key === 'w' || e.key === 'W') {
        keysPressed.current.forward = true;
      } else if (e.key === 'ArrowDown' || e.code === 'KeyS' || e.key === 's' || e.key === 'S') {
        keysPressed.current.backward = true;
      } else if (e.key === 'ArrowLeft' || e.code === 'KeyA' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = true;
      } else if (e.key === 'ArrowRight' || e.code === 'KeyD' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = true;
      }
    };

    const handleWindowKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.code === 'KeyW' || e.key === 'w' || e.key === 'W') {
        keysPressed.current.forward = false;
      } else if (e.key === 'ArrowDown' || e.code === 'KeyS' || e.key === 's' || e.key === 'S') {
        keysPressed.current.backward = false;
      } else if (e.key === 'ArrowLeft' || e.code === 'KeyA' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = false;
      } else if (e.key === 'ArrowRight' || e.code === 'KeyD' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = false;
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    window.addEventListener('keyup', handleWindowKeyUp);
    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
      window.removeEventListener('keyup', handleWindowKeyUp);
    };
  }, []);

  // Road Walk Gesture State
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const progRef = useRef(walkProgress);
  const yawRef = useRef(Math.PI / 2);
  const pitchRef = useRef(-0.02);

  // Sync internal progress when walkProgress prop changes from external buttons or slider
  useEffect(() => {
    progRef.current = walkProgress;
  }, [walkProgress]);

  // When switching roads, orient camera along the road forward direction
  useEffect(() => {
    if (cameraPreset === 'roadWalk') {
      const road = WALK_ROADS[walkRoadIndex] || WALK_ROADS[0];
      yawRef.current = road.forwardYaw;
      pitchRef.current = -0.02;
    }
  }, [walkRoadIndex, cameraPreset]);

  // Hand Gesture Drag Navigation on the Canvas for Road View (USER REQUIREMENT)
  useEffect(() => {
    if (cameraPreset !== 'roadWalk' && cameraPreset !== 'park' && cameraPreset !== 'parkGround') return;

    const dom = gl.domElement;

    const handlePointerDown = (e) => {
      isDragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };

      // Slow, steady forward and backward dragging (USER REQUIREMENT: "slow forward going and backward going for 3d")
      const moveDelta = -dy * 0.0012;
      const nextProg = Math.max(0, Math.min(1, progRef.current + moveDelta));
      progRef.current = nextProg;
      if (onWalkProgressChange) {
        onWalkProgressChange(nextProg);
      }

      // Keep view strictly facing forward along road without 360-degree rotation (User requirement: "dont implement to move 360 degrees layout")
      const road = WALK_ROADS[walkRoadIndex] || WALK_ROADS[0];
      yawRef.current = road.forwardYaw;
      pitchRef.current = -0.02;
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    // Smooth Slow Wheel Interaction for Walk Mode:
    // Scroll forward (deltaY < 0) -> slow, steady forward walking (~0.8m per notch).
    // Scroll backward (deltaY > 0) -> slow, steady backward walking.
    // Deliberate continuous backward scroll at start of road -> gently minimize and pull out of walk into overview.
    const handleWheel = (e) => {
      e.preventDefault();

      if (e.deltaY > 0) {
        if (progRef.current <= 0.015) {
          wheelOutAccum.current += Math.abs(e.deltaY);
          if (wheelOutAccum.current > 300) {
            wheelOutAccum.current = 0;
            animRate.current = 1.15; // Slow, graceful drone ascent
            if (onExitWalk) {
              onExitWalk();
            }
            return;
          }
        } else {
          wheelOutAccum.current = 0;
          const moveStep = -0.0065; // Slow, gentle backward walking step
          const nextProg = Math.max(0, progRef.current + moveStep);
          progRef.current = nextProg;
          if (onWalkProgressChange) {
            onWalkProgressChange(nextProg);
          }
        }
      } else {
        wheelOutAccum.current = 0;
        const moveStep = 0.0065; // Slow, gentle forward walking step
        const nextProg = Math.min(1, progRef.current + moveStep);
        progRef.current = nextProg;
        if (onWalkProgressChange) {
          onWalkProgressChange(nextProg);
        }
      }
    };

    // Keyboard ESC key to smoothly exit walk view and return to overview
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        animRate.current = 1.15;
        if (onExitWalk) {
          onExitWalk();
        }
      }
    };

    // Double-click on ground to return to 3D layout overview
    const handleDblClick = () => {
      animRate.current = 1.15;
      if (onExitWalk) {
        onExitWalk();
      }
    };

    // Touch gesture pinch-out or swipe-down to exit walk view
    let touchStartDist = 0;
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        // User pinching inward to zoom out/minimize
        if (touchStartDist - dist > 50) {
          touchStartDist = 0;
          animRate.current = 1.15;
          if (onExitWalk) {
            onExitWalk();
          }
        }
      }
    };

    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('dblclick', handleDblClick);
    window.addEventListener('keydown', handleKeyDown);
    dom.addEventListener('touchstart', handleTouchStart, { passive: true });
    dom.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('dblclick', handleDblClick);
      window.removeEventListener('keydown', handleKeyDown);
      dom.removeEventListener('touchstart', handleTouchStart);
      dom.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gl, cameraPreset, onWalkProgressChange, onExitWalk]);

  // Preset Camera Transitions for Overview, Park, TopDown, and Highway
  const isFirstMount = useRef(true);
  useEffect(() => {
    // User requirement: "dont zoom in and zoom out automatically"
    // On initial mount or load, DO NOT run automatic zoom animations!
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevPresetRef.current = cameraPreset;
      animatingRef.current = false;
      return;
    }

    // If preset hasn't changed, do not trigger auto-animation
    if (prevPresetRef.current === cameraPreset) {
      return;
    }

    const isExitingWalk =
      prevPresetRef.current === 'roadWalk' ||
      prevPresetRef.current === 'park' ||
      prevPresetRef.current === 'parkGround';

    if (cameraPreset === 'roadWalk') {
      animatingRef.current = false;
    } else if (cameraPreset === 'park' || cameraPreset === 'parkGround') {
      // Ground perspective inside Ac. 0.758 park
      targetPos.current.set(-73, 2.0, -14);
      targetLook.current.set(-71, 1.2, -34);
      if (controlsRef.current) {
        currentLook.current.copy(controlsRef.current.target);
      }
      animRate.current = 1.25;
      animatingRef.current = true;
    } else if (cameraPreset === 'topDown') {
      // Top-Down orthographic/overhead view
      targetPos.current.set(-9, 210, 6);
      targetLook.current.set(-9, 0, 6);
      if (controlsRef.current) {
        currentLook.current.copy(controlsRef.current.target);
      }
      animRate.current = 1.35;
      animatingRef.current = true;
    } else if (cameraPreset === 'mapView') {
      // 3D Regional Map View matching Plots99 Image (media_1792061116841_a13f2ed9.png)
      targetPos.current.set(0, 360, 460);
      targetLook.current.set(0, 0, 0);
      if (controlsRef.current) {
        currentLook.current.copy(controlsRef.current.target);
      }
      animRate.current = 1.3;
      animatingRef.current = true;
    } else if (cameraPreset === 'highway') {
      targetPos.current.set(78, 22, 22);
      targetLook.current.set(50, 0, -4);
      if (controlsRef.current) {
        currentLook.current.copy(controlsRef.current.target);
      }
      animRate.current = 1.3;
      animatingRef.current = true;
    } else if (isExitingWalk) {
      // Smoothly ascend from current street walk position up into overview
      const startX = camera.position.x;
      const startZ = camera.position.z;
      targetPos.current.set(startX, 82, startZ + 95);
      targetLook.current.set(startX, 0, startZ - 5);
      if (controlsRef.current) {
        currentLook.current.copy(controlsRef.current.target);
      }
      animRate.current = 1.35;
      animatingRef.current = true;
    }

    prevPresetRef.current = cameraPreset;
  }, [cameraPreset]);

  useFrame((_, delta) => {
    // Notify parent of camera azimuth rotation for compass needle sync
    if (controlsRef.current && onAzimuthChange) {
      const az = Math.atan2(
        camera.position.x - controlsRef.current.target.x,
        camera.position.z - controlsRef.current.target.z
      );
      if (Math.abs(az - lastAzimuthRef.current) > 0.015) {
        lastAzimuthRef.current = az;
        onAzimuthChange(az);
      }
    }

    if (cameraPreset === 'roadWalk') {
      const road = WALK_ROADS[walkRoadIndex] || WALK_ROADS[0];
      const baseYaw = road.forwardYaw;

      // Slow, continuous keyboard walking forward and backward
      if (keysPressed.current.forward) {
        const nextProg = Math.min(1, progRef.current + delta * 0.035);
        progRef.current = nextProg;
        if (onWalkProgressChange) onWalkProgressChange(nextProg);
      }
      if (keysPressed.current.backward) {
        const nextProg = Math.max(0, progRef.current - delta * 0.035);
        progRef.current = nextProg;
        if (onWalkProgressChange) onWalkProgressChange(nextProg);
      }
      // Keep view facing straight forward along road without 360-degree turning (User requirement: "dont implement to move 360 degrees layout")
      yawRef.current = road.forwardYaw;
      pitchRef.current = -0.02;

      // Direct Responsive Road Walk Camera Control
      let tx, ty = road.cameraHeight, tz;
      if (road.axis === 'x') {
        tx = road.startX + (road.endX - road.startX) * progRef.current;
        tz = road.z;
      } else {
        tx = road.x;
        tz = road.startZ + (road.endZ - road.startZ) * progRef.current;
      }

      // Smooth camera interpolation for slow, graceful forward and backward movement
      const lerpSpeed = isDragging.current ? 3.8 : 2.6;
      const factor = 1 - Math.exp(-delta * lerpSpeed);
      camera.position.x += (tx - camera.position.x) * factor;
      camera.position.y += (ty - camera.position.y) * factor;
      camera.position.z += (tz - camera.position.z) * factor;

      // Compute look direction directly forward down the avenue
      const lookDist = 18;
      const lx = camera.position.x + Math.sin(road.forwardYaw) * Math.cos(-0.02) * lookDist;
      const ly = camera.position.y + Math.sin(-0.02) * lookDist;
      const lz = camera.position.z - Math.cos(road.forwardYaw) * Math.cos(-0.02) * lookDist;
      camera.lookAt(lx, ly, lz);

      if (controlsRef.current) {
        controlsRef.current.target.set(lx, ly, lz);
      }
      currentLook.current.set(lx, ly, lz);
    } else if (animatingRef.current) {
      const rate = animRate.current || 1.15;
      // Cap step at 0.045 for ultra smooth, slow motion
      const step = Math.min(delta * rate, 0.045);

      camera.position.lerp(targetPos.current, step);
      currentLook.current.lerp(targetLook.current, step);
      camera.lookAt(currentLook.current);

      if (controlsRef.current) {
        controlsRef.current.target.copy(currentLook.current);
      }

      const distPos = camera.position.distanceTo(targetPos.current);
      const distLook = currentLook.current.distanceTo(targetLook.current);

      if (distPos < 0.25 && distLook < 0.25) {
        camera.position.copy(targetPos.current);
        currentLook.current.copy(targetLook.current);
        camera.lookAt(targetLook.current);
        if (controlsRef.current) {
          controlsRef.current.target.copy(targetLook.current);
          controlsRef.current.update();
        }
        animatingRef.current = false;
        if (onResetComplete) onResetComplete();
      }
    } else if (controlsRef.current) {
      // Continuous Slow Keyboard Dolly Forward / Backward in 3D Overview Mode
      if (keysPressed.current.forward) {
        const target = controlsRef.current.target;
        const dist = camera.position.distanceTo(target);
        if (dist > 8) {
          const moveStep = Math.max(10, dist * 0.45) * delta; // Proportional smooth forward movement
          const dir = new THREE.Vector3().subVectors(target, camera.position).normalize();
          camera.position.addScaledVector(dir, moveStep);
          controlsRef.current.update();
        }
      }
      if (keysPressed.current.backward) {
        const target = controlsRef.current.target;
        const dist = camera.position.distanceTo(target);
        // User requirement: "can zoom in zoom out manually for like small particle" -> allows full manual zoom out
        if (dist < 2600) {
          const moveStep = Math.max(10, dist * 0.45) * delta; // Proportional smooth backward movement
          const dir = new THREE.Vector3().subVectors(camera.position, target).normalize();
          camera.position.addScaledVector(dir, moveStep);
          controlsRef.current.update();
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={defaultTarget}
      enabled={cameraPreset !== 'roadWalk'}
      enableRotate={false}
      enableZoom={true}
      enablePan={true}
      screenSpacePanning={true}
      zoomSpeed={0.95}
      mouseButtons={{
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
      touches={{
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
      minDistance={8}
      maxDistance={2800}
      enableDamping={true}
      dampingFactor={0.08}
    />
  );
}

// 3D Volumetric Plot Tile with physical Height, Width, Depth and Plinth Base
export function Plot3D({
  plot,
  isSelected,
  isDimmed = false,
  isSearchedMatch = false,
  isHovered = false,
  onSelect,
  isMeasureMode,
  onMeasurePoint
}) {
  const [hovered, setHovered] = useState(false);
  const activeHover = isHovered || hovered;
  const meta = statusColors[plot.status] || statusColors.available;

  const color = useMemo(() => {
    if (isSelected) {
      if (plot.status === 'sold') return '#F87171';
      if (plot.status === 'blocked') return '#38BDF8';
      if (plot.status === 'booked' || plot.status === 'reserved') return '#FBBF24';
      return '#68D391';
    }
    if (isSearchedMatch) return '#EA580C';
    if (activeHover) return '#FB923C';
    return meta.threeColor;
  }, [plot.status, isSelected, isSearchedMatch, activeHover, meta.threeColor]);

  const [cx, cz] = plot.center || [0, 0];
  const w = plot.bounds?.width || 10;
  const d = plot.bounds?.depth || 10;

  // Realistic Physical 3D Tile Dimensions: Height (0.22m plinth slab), Width and Depth
  const tileHeight = 0.22;
  const liftY = isSelected ? 0.32 : isSearchedMatch ? 0.22 : activeHover ? 0.12 : 0;
  const posY = (tileHeight / 2) + 0.03 + liftY;
  const tileW = Math.max(w - 0.08, 0.5);
  const tileD = Math.max(d - 0.08, 0.5);
  const topSurfaceY = (tileHeight / 2) + 0.01;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isMeasureMode && onMeasurePoint) {
      onMeasurePoint([cx, tileHeight + liftY + 0.1, cz]);
    } else {
      onSelect(plot);
    }
  };

  const customShape = useMemo(() => {
    if (!plot.hasCustomPolygon || !plot.polygon) return null;
    const shape = new THREE.Shape();
    plot.polygon.forEach(([px, pz], idx) => {
      const lx = px - cx;
      const lz = -(pz - cz);
      if (idx === 0) shape.moveTo(lx, lz);
      else shape.lineTo(lx, lz);
    });
    shape.closePath();
    return shape;
  }, [plot.hasCustomPolygon, plot.polygon, cx, cz]);

  const customExtrudeGeom = useMemo(() => {
    if (!customShape) return null;
    return new THREE.ExtrudeGeometry(customShape, { depth: tileHeight, bevelEnabled: false });
  }, [customShape, tileHeight]);

  const customEdgesGeom = useMemo(() => {
    if (!customExtrudeGeom) return null;
    return new THREE.EdgesGeometry(customExtrudeGeom);
  }, [customExtrudeGeom]);

  const boxEdgesGeom = useMemo(() => {
    return new THREE.EdgesGeometry(new THREE.BoxGeometry(tileW, tileHeight, tileD));
  }, [tileW, tileHeight, tileD]);

  return (
    <group position={[cx, posY, cz]}>
      {/* 3D Volumetric Foundation Plinth Box with Height, Width, and Depth */}
      {customShape && customExtrudeGeom ? (
        <group
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
          }}
        >
          <mesh geometry={customExtrudeGeom} rotation={[-Math.PI / 2, 0, 0]} position={[0, -tileHeight / 2, 0]}>
            <meshStandardMaterial color={color} roughness={0.5} opacity={isDimmed ? 0.25 : 1.0} transparent={isDimmed} />
          </mesh>
          {customEdgesGeom && (
            <lineSegments geometry={customEdgesGeom} rotation={[-Math.PI / 2, 0, 0]} position={[0, -tileHeight / 2, 0]}>
              <lineBasicMaterial
                color={isSelected || isSearchedMatch ? '#FFFFFF' : '#64748B'}
                linewidth={isSelected || isSearchedMatch ? 3 : 1.5}
                opacity={isDimmed ? 0.3 : 1.0}
                transparent={isDimmed}
              />
            </lineSegments>
          )}
        </group>
      ) : (
        <>
          <mesh
            onClick={handleClick}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHovered(false);
            }}
          >
            <boxGeometry args={[tileW, tileHeight, tileD]} />
            {/* +X (Right side) */}
            <meshStandardMaterial attach="material-0" color={isSelected ? '#C2410C' : '#CBD5E1'} roughness={0.7} />
            {/* -X (Left side) */}
            <meshStandardMaterial attach="material-1" color={isSelected ? '#C2410C' : '#CBD5E1'} roughness={0.7} />
            {/* +Y (Top surface) with vibrant status color */}
            <meshStandardMaterial attach="material-2" color={color} roughness={0.5} opacity={isDimmed ? 0.25 : 1.0} transparent={isDimmed} />
            {/* -Y (Bottom) */}
            <meshStandardMaterial attach="material-3" color="#94A3B8" roughness={0.9} />
            {/* +Z (Front side) */}
            <meshStandardMaterial attach="material-4" color={isSelected ? '#C2410C' : '#CBD5E1'} roughness={0.7} />
            {/* -Z (Back side) */}
            <meshStandardMaterial attach="material-5" color={isSelected ? '#C2410C' : '#CBD5E1'} roughness={0.7} />
          </mesh>

          {/* Crisp 3D Demarcation Bevel Edges highlighting Height, Width, Depth */}
          <lineSegments geometry={boxEdgesGeom}>
            <lineBasicMaterial
              color={isSelected || isSearchedMatch ? '#FFFFFF' : '#64748B'}
              linewidth={isSelected || isSearchedMatch ? 3 : 1.5}
              opacity={isDimmed ? 0.3 : 1.0}
              transparent={isDimmed}
            />
          </lineSegments>
        </>
      )}

      {/* Glowing Target Ring on Searched Match */}
      {isSearchedMatch && (
        <group position={[0, topSurfaceY + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <ringGeometry args={[Math.min(w, d) * 0.38, Math.min(w, d) * 0.46, 32]} />
            <meshBasicMaterial color="#EA580C" />
          </mesh>
        </group>
      )}

      {/* Plot Number in Center (Exact Match to Plots99 Image 1, 2, 4) */}
      <group position={[0, topSurfaceY + 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text
          fontSize={Math.min(w, d) * 0.32 > 1.9 ? 1.9 : Math.max(Math.min(w, d) * 0.28, 1.35)}
          color={plot.status === 'sold' ? '#7F1D1D' : '#1E293B'}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {String(plot.plotNumber)}
        </Text>
      </group>

      {/* Edge Dimensions when Selected or Hovered (matching Screenshot 3: 50', 30') */}
      {(isSelected || activeHover) && (
        <group position={[0, topSurfaceY + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text
            position={[0, d / 2 - 0.7, 0]}
            fontSize={0.95}
            color={isSelected ? '#FFFFFF' : '#0F172A'}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {plot.dimensions?.split('x')[0]?.trim() || `${Math.round(w * 3.28)}'`}
          </Text>
          <Text
            position={[0, -d / 2 + 0.7, 0]}
            fontSize={0.95}
            color={isSelected ? '#FFFFFF' : '#0F172A'}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {plot.dimensions?.split('x')[0]?.trim() || `${Math.round(w * 3.28)}'`}
          </Text>
          <Text
            position={[-w / 2 + 0.7, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            fontSize={0.95}
            color={isSelected ? '#FFFFFF' : '#0F172A'}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {plot.dimensions?.split('x')[1]?.trim() || `${Math.round(d * 3.28)}'`}
          </Text>
          <Text
            position={[w / 2 - 0.7, 0, 0]}
            rotation={[0, 0, -Math.PI / 2]}
            fontSize={0.95}
            color={isSelected ? '#FFFFFF' : '#0F172A'}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {plot.dimensions?.split('x')[1]?.trim() || `${Math.round(d * 3.28)}'`}
          </Text>
        </group>
      )}
    </group>
  );
}

// Shared Static Geometries & Materials for Avenue Palms (Zero GC allocations on mount)
const palmPlanterGeom = new THREE.RingGeometry(0.16, 0.32, 12);
const palmPlanterMat = new THREE.MeshStandardMaterial({ color: '#94A3B8', roughness: 0.8 });
const palmTrunkGeom = new THREE.CylinderGeometry(0.075, 0.098, 1.76, 8);
const palmTrunkMat = new THREE.MeshStandardMaterial({ color: '#948B7E', roughness: 0.82 });
const palmCollarGeom = new THREE.CylinderGeometry(0.11, 0.08, 0.18, 8);
const palmCollarMat = new THREE.MeshStandardMaterial({ color: '#C8AF58', roughness: 0.7 });
const palmFrondGeom = new THREE.BoxGeometry(1.6, 0.02, 0.48);
const palmFrondMat1 = new THREE.MeshStandardMaterial({ color: '#6BA322', roughness: 0.55 });
const palmFrondMat2 = new THREE.MeshStandardMaterial({ color: '#7DBB28', roughness: 0.55 });
const palmFrondAngles = [0, 60, 120, 180, 240, 300];

// Authoritative Plots99 Avenue Palm Tree (Exact match to User Images 1 & 2: low human-scale, drooping fronds)
export function Plots99AvenuePalm({ position = [0, 0, 0], scale = 1.0 }) {
  return (
    <group position={position} scale={scale}>
      {/* 1. Circular Stone Planter Base in Sidewalk */}
      <mesh geometry={palmPlanterGeom} material={palmPlanterMat} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} />

      {/* 2. Slender, Human-Scale Straight Ash-Grey Palm Trunk */}
      <mesh geometry={palmTrunkGeom} material={palmTrunkMat} position={[0, 0.88, 0]} />

      {/* 3. Fibrous Trimmed Frond Stubs Collar */}
      <mesh geometry={palmCollarGeom} material={palmCollarMat} position={[0, 1.76, 0]} />

      {/* 4. 6 Broad Tropical Fronds Drooping Gracefully Downward */}
      {palmFrondAngles.map((ang, idx) => {
        const rad = (ang * Math.PI) / 180;
        return (
          <mesh
            key={`frond-${idx}`}
            geometry={palmFrondGeom}
            material={idx % 2 === 0 ? palmFrondMat1 : palmFrondMat2}
            position={[Math.cos(rad) * 0.72, 1.74 - (idx % 2) * 0.06, Math.sin(rad) * 0.72]}
            rotation={[-0.32 * Math.sin(rad), -rad, -0.42]}
          />
        );
      })}
    </group>
  );
}

export const StraightAvenueTree = Plots99AvenuePalm;

// Natural Perimeter Canopy Shade Tree for Surrounding Greenery
export function PerimeterCanopyTree({ position = [0, 0, 0], scale = 1.0 }) {
  return (
    <group position={position} scale={scale}>
      {/* Natural Bark Trunk */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.18, 0.26, 3.6, 8]} />
        <meshStandardMaterial color="#4A3B32" roughness={0.9} />
      </mesh>
      {/* Lower Dense Canopy Tier */}
      <mesh position={[0, 3.8, 0]}>
        <sphereGeometry args={[1.8, 8, 8]} />
        <meshStandardMaterial color="#2D5A27" roughness={0.7} />
      </mesh>
      {/* Upper Lush Canopy Tier */}
      <mesh position={[0, 4.6, 0]}>
        <sphereGeometry args={[1.35, 8, 8]} />
        <meshStandardMaterial color="#4E9A1A" roughness={0.65} />
      </mesh>
    </group>
  );
}

// Shared Procedural Lush Grass Turf Texture Cache
let grassTurfTextureCache = null;

export function getGrassTurfTexture() {
  if (typeof document === 'undefined') return null;
  if (grassTurfTextureCache) return grassTurfTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // 1. Lush Bermuda turf green base
  ctx.fillStyle = '#6AA81A';
  ctx.fillRect(0, 0, 256, 256);

  // 2. Subtle lawn mowing stripes
  for (let x = 0; x < 256; x += 64) {
    ctx.fillStyle = 'rgba(126, 196, 32, 0.16)';
    ctx.fillRect(x, 0, 32, 256);
  }

  // 3. Ultra-fast procedural stippling via direct pixel buffer (<2ms)
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 32;
    data[i] = Math.min(255, Math.max(0, data[i] + noise * 0.7));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.4));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  grassTurfTextureCache = texture;
  return texture;
}



// High-Quality Realistic 3D Low-Poly Vehicles driving on Venture Roads
export function Vehicle3D({ color }) {
  return (
    <group>
      {/* Aerodynamic Car Body with glossy finish */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.45, 0.38, 2.7]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Cabin Roof / Tinted Glass Canopy */}
      <mesh position={[0, 0.62, -0.1]}>
        <boxGeometry args={[1.18, 0.32, 1.55]} />
        <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Front Windshield Tint */}
      <mesh position={[0, 0.58, 0.7]} rotation={[0.45, 0, 0]}>
        <planeGeometry args={[1.1, 0.35]} />
        <meshStandardMaterial color="#1E293B" roughness={0.1} />
      </mesh>
      {/* Rear Windshield Tint */}
      <mesh position={[0, 0.58, -0.9]} rotation={[-0.45, Math.PI, 0]}>
        <planeGeometry args={[1.1, 0.35]} />
        <meshStandardMaterial color="#1E293B" roughness={0.1} />
      </mesh>
      {/* Dual Glowing LED Headlights */}
      <mesh position={[-0.45, 0.32, 1.36]}>
        <boxGeometry args={[0.22, 0.12, 0.04]} />
        <meshBasicMaterial color="#FEF08A" />
      </mesh>
      <mesh position={[0.45, 0.32, 1.36]}>
        <boxGeometry args={[0.22, 0.12, 0.04]} />
        <meshBasicMaterial color="#FEF08A" />
      </mesh>
      {/* Dual Red LED Taillights */}
      <mesh position={[-0.45, 0.32, -1.36]}>
        <boxGeometry args={[0.22, 0.12, 0.04]} />
        <meshBasicMaterial color="#EF4444" />
      </mesh>
      <mesh position={[0.45, 0.32, -1.36]}>
        <boxGeometry args={[0.22, 0.12, 0.04]} />
        <meshBasicMaterial color="#EF4444" />
      </mesh>
      {/* 4 Rubber Wheels with Silver Hubs */}
      {[-0.74, 0.74].map((wx, i) =>
        [-0.82, 0.82].map((wz, j) => (
          <group key={`${i}-${j}`} position={[wx, 0.16, wz]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.14, 12]} />
              <meshStandardMaterial color="#111827" roughness={0.8} />
            </mesh>
            <mesh position={[wx > 0 ? 0.075 : -0.075, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <circleGeometry args={[0.09, 8]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

// Moving Vehicles across Highway AND Venture Roads
export function MovingVehicles3D({ animate = true }) {
  const hwySouthRef = useRef();
  const hwyNorthRef = useRef();
  const road60EastRef = useRef();
  const road60WestRef = useRef();
  const roadMidEastRef = useRef();
  const roadMidWestRef = useRef();
  const roadV2Ref = useRef();

  useFrame((_, delta) => {
    if (!animate) return;
    // 1. Srisailam Highway Southbound (White SUV)
    if (hwySouthRef.current) {
      hwySouthRef.current.position.z += delta * 16;
      if (hwySouthRef.current.position.z > 66) hwySouthRef.current.position.z = -56;
    }
    // 2. Srisailam Highway Northbound (Emerald Green Sedan)
    if (hwyNorthRef.current) {
      hwyNorthRef.current.position.z -= delta * 15;
      if (hwyNorthRef.current.position.z < -56) hwyNorthRef.current.position.z = 66;
    }
    // 3. 60ft Road Eastbound (Silver Sedan)
    if (road60EastRef.current) {
      road60EastRef.current.position.x += delta * 13;
      if (road60EastRef.current.position.x > 74) road60EastRef.current.position.x = -88;
    }
    // 4. 60ft Road Westbound (Royal Blue Sedan)
    if (road60WestRef.current) {
      road60WestRef.current.position.x -= delta * 12;
      if (road60WestRef.current.position.x < -88) road60WestRef.current.position.x = 74;
    }
    // 5. 33ft Central Boulevard Eastbound (Ruby Red Sedan matching Plots99 photo!)
    if (roadMidEastRef.current) {
      roadMidEastRef.current.position.x += delta * 9.5;
      if (roadMidEastRef.current.position.x > 62) roadMidEastRef.current.position.x = -72;
    }
    // 6. 33ft Central Boulevard Westbound (Warm Amber Compact)
    if (roadMidWestRef.current) {
      roadMidWestRef.current.position.x -= delta * 8.5;
      if (roadMidWestRef.current.position.x < -72) roadMidWestRef.current.position.x = 62;
    }
    // 7. Internal Cross Street Road V2 Southbound (Violet Crossover)
    if (roadV2Ref.current) {
      roadV2Ref.current.position.z += delta * 8;
      if (roadV2Ref.current.position.z > 58) roadV2Ref.current.position.z = -38;
    }
  });

  return (
    <group>
      {/* 1. East 33ft Road: White SUV (Southbound) */}
      <group ref={hwySouthRef} position={[72.5, 0.05, -25]}>
        <Vehicle3D color="#F8FAFC" />
      </group>
      {/* 2. East 33ft Road: Emerald Green Sedan (Northbound) */}
      <group ref={hwyNorthRef} position={[74.5, 0.05, 35]} rotation={[0, Math.PI, 0]}>
        <Vehicle3D color="#059669" />
      </group>
      {/* 3. 60ft Arterial Road: Silver Sedan (Eastbound towards Highway) */}
      <group ref={road60EastRef} position={[-40, 0.05, -44.5]} rotation={[0, Math.PI / 2, 0]}>
        <Vehicle3D color="#E2E8F0" />
      </group>
      {/* 4. 60ft Arterial Road: Royal Blue Sedan (Westbound) */}
      <group ref={road60WestRef} position={[30, 0.05, -49.5]} rotation={[0, -Math.PI / 2, 0]}>
        <Vehicle3D color="#2563EB" />
      </group>
      {/* 5. 33ft Central Boulevard: Ruby Red Sedan (Eastbound, matching Plots99 photo!) */}
      <group ref={roadMidEastRef} position={[-20, 0.05, 1.8]} rotation={[0, Math.PI / 2, 0]}>
        <Vehicle3D color="#DC2626" />
      </group>
      {/* 6. 33ft Central Boulevard: Warm Amber Compact (Westbound) */}
      <group ref={roadMidWestRef} position={[40, 0.05, -1.0]} rotation={[0, -Math.PI / 2, 0]}>
        <Vehicle3D color="#D97706" />
      </group>
      {/* 7. Internal Cross Street Road V2: Violet Crossover (Southbound) */}
      <group ref={roadV2Ref} position={[-3.5, 0.05, 15]}>
        <Vehicle3D color="#7C3AED" />
      </group>
    </group>
  );
}


// Low Cycad Palm Shrub for the Park Lawn (matching Screenshot 3 & 4)
export function ParkCycadShrub({ position = [0, 0, 0], scale = 1.0 }) {
  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <group position={position} scale={scale}>
      {/* Small Dark Brown Trunk Base */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.32, 8]} />
        <meshBasicMaterial color="#5C4033" />
      </mesh>

      {/* 12 Radiating Arching Cycad Palm Leaflets */}
      {angles.map((ang, idx) => (
        <group key={idx} position={[0, 0.28, 0]} rotation={[0.42, (ang * Math.PI) / 180, -0.32]}>
          <mesh position={[0.55, -0.06, 0]} rotation={[0, 0, -0.2]} scale={[1.15, 0.035, 0.32]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#2B5329" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Little Flower Patch for Park Lawn (matching Screenshot 3 & 4: white and orange flowers)
export function FlowerPatch({ position = [0, 0, 0], isOrange = false }) {
  return (
    <group position={position}>
      {/* Flower Petals */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 5]} />
        <meshBasicMaterial color={isOrange ? '#F97316' : '#FFFFFF'} />
      </mesh>
      {/* Blossom Core */}
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 6]} />
        <meshBasicMaterial color="#FBBF24" />
      </mesh>
    </group>
  );
}

// Authoritative Block-by-Block Avenue Borders & Straight Trees
// Placed strictly along internal streets in between blocks all the way through; zero trees at entrance or corners
export const BLOCK_AVENUE_BORDERS = [
  // ==========================================
  // NORTH STREETS (IN BETWEEN BLOCKS, Z: -40 to -5)
  // Continuous avenue palm trees lining both curbs of each internal avenue
  // Spaced at ~5m, keeping 60' road & 33' MID road intersections clear
  // ==========================================

  // Avenue V1 (Between Block A and Block B)
  {
    x: -34.8, z: -22.5, w: 0.8, d: 33.0, isHorizontal: false,
    trees: [[-34.8, -37], [-34.8, -32], [-34.8, -27], [-34.8, -22], [-34.8, -17], [-34.8, -12], [-34.8, -7]]
  },
  {
    x: -30.2, z: -22.5, w: 0.8, d: 33.0, isHorizontal: false,
    trees: [[-30.2, -37], [-30.2, -32], [-30.2, -27], [-30.2, -22], [-30.2, -17], [-30.2, -12], [-30.2, -7]]
  },

  // Avenue V2 (Between Block B and Block C)
  {
    x: -5.8, z: -22.5, w: 0.8, d: 33.0, isHorizontal: false,
    trees: [[-5.8, -37], [-5.8, -32], [-5.8, -27], [-5.8, -22], [-5.8, -17], [-5.8, -12], [-5.8, -7]]
  },
  {
    x: -1.2, z: -22.5, w: 0.8, d: 33.0, isHorizontal: false,
    trees: [[-1.2, -37], [-1.2, -32], [-1.2, -27], [-1.2, -22], [-1.2, -17], [-1.2, -12], [-1.2, -7]]
  },

  // Avenue V3 (Between Block C and Block D)
  {
    x: 23.2, z: -22.5, w: 0.8, d: 33.0, isHorizontal: false,
    trees: [[23.2, -37], [23.2, -32], [23.2, -27], [23.2, -22], [23.2, -17], [23.2, -12], [23.2, -7]]
  },
  {
    x: 27.8, z: -22.5, w: 0.8, d: 33.0, isHorizontal: false,
    trees: [[27.8, -37], [27.8, -32], [27.8, -27], [27.8, -22], [27.8, -17], [27.8, -12], [27.8, -7]]
  },

  // Avenue V4 (Between Block D and Block E)
  {
    x: 51.2, z: -22.5, w: 0.8, d: 33.0, isHorizontal: false,
    trees: [[51.2, -37], [51.2, -32], [51.2, -27], [51.2, -22], [51.2, -17], [51.2, -12], [51.2, -7]]
  },
  {
    x: 55.8, z: -22.5, w: 0.8, d: 33.0, isHorizontal: false,
    trees: [[55.8, -37], [55.8, -32], [55.8, -27], [55.8, -22], [55.8, -17], [55.8, -12], [55.8, -7]]
  },

  // ==========================================
  // SOUTH STREETS (IN BETWEEN BLOCKS, Z: 6 to 65)
  // Continuous avenue palm trees lining both curbs all the way along the street
  // ==========================================

  // Avenue V0 (Between Block F and Block G)
  {
    x: -63.8, z: 27.0, w: 0.8, d: 40.0, isHorizontal: false,
    trees: [[-63.8, 9], [-63.8, 15], [-63.8, 21], [-63.8, 27], [-63.8, 33], [-63.8, 39], [-63.8, 45]]
  },
  {
    x: -59.2, z: 27.0, w: 0.8, d: 40.0, isHorizontal: false,
    trees: [[-59.2, 9], [-59.2, 15], [-59.2, 21], [-59.2, 27], [-59.2, 33], [-59.2, 39], [-59.2, 45]]
  },

  // Avenue V1 (Between Block G and Block H)
  {
    x: -34.8, z: 34.0, w: 0.8, d: 52.0, isHorizontal: false,
    trees: [[-34.8, 9], [-34.8, 14], [-34.8, 19], [-34.8, 24], [-34.8, 29], [-34.8, 34], [-34.8, 39], [-34.8, 44], [-34.8, 49], [-34.8, 54], [-34.8, 58]]
  },
  {
    x: -30.2, z: 34.0, w: 0.8, d: 52.0, isHorizontal: false,
    trees: [[-30.2, 9], [-30.2, 14], [-30.2, 19], [-30.2, 24], [-30.2, 29], [-30.2, 34], [-30.2, 39], [-30.2, 44], [-30.2, 49], [-30.2, 54], [-30.2, 58]]
  },

  // Avenue V2 (Between Block H and Block I)
  {
    x: -5.8, z: 34.0, w: 0.8, d: 52.0, isHorizontal: false,
    trees: [[-5.8, 9], [-5.8, 14], [-5.8, 19], [-5.8, 24], [-5.8, 29], [-5.8, 34], [-5.8, 39], [-5.8, 44], [-5.8, 49], [-5.8, 54], [-5.8, 58]]
  },
  {
    x: -1.2, z: 34.0, w: 0.8, d: 52.0, isHorizontal: false,
    trees: [[-1.2, 9], [-1.2, 14], [-1.2, 19], [-1.2, 24], [-1.2, 29], [-1.2, 34], [-1.2, 39], [-1.2, 44], [-1.2, 49], [-1.2, 54], [-1.2, 58]]
  },

  // Avenue V3 (Between Block I and Block J)
  {
    x: 23.2, z: 34.0, w: 0.8, d: 52.0, isHorizontal: false,
    trees: [[23.2, 9], [23.2, 14], [23.2, 19], [23.2, 24], [23.2, 29], [23.2, 34], [23.2, 39], [23.2, 44], [23.2, 49], [23.2, 54], [23.2, 58]]
  },
  {
    x: 27.8, z: 34.0, w: 0.8, d: 52.0, isHorizontal: false,
    trees: [[27.8, 9], [27.8, 14], [27.8, 19], [27.8, 24], [27.8, 29], [27.8, 34], [27.8, 39], [27.8, 44], [27.8, 49], [27.8, 54], [27.8, 58]]
  },

  // Avenue V4 (Between Block J and Block K)
  {
    x: 51.2, z: 35.5, w: 0.8, d: 55.0, isHorizontal: false,
    trees: [[51.2, 9], [51.2, 14], [51.2, 19], [51.2, 24], [51.2, 29], [51.2, 34], [51.2, 39], [51.2, 44], [51.2, 49], [51.2, 54], [51.2, 59], [51.2, 63]]
  },
  {
    x: 55.8, z: 35.5, w: 0.8, d: 55.0, isHorizontal: false,
    trees: [[55.8, 9], [55.8, 14], [55.8, 19], [55.8, 24], [55.8, 29], [55.8, 34], [55.8, 39], [55.8, 44], [55.8, 49], [55.8, 54], [55.8, 59], [55.8, 63]]
  },

  // ==========================================
  // CENTRAL 33' MAIN BOULEVARD (BETWEEN NORTH & SOUTH BLOCKS, Z: -4.5 to 5.5)
  // Continuous avenue palm trees lining both curbs of 33' Boulevard strictly in between blocks
  // ==========================================
  // North Curb of 33' Boulevard (Facing North Blocks A, B, C, D)
  {
    x: -47.0, z: -4.5, w: 22.0, d: 0.8, isHorizontal: true,
    trees: [[-55, -4.5], [-49, -4.5], [-43, -4.5], [-37, -4.5]]
  },
  {
    x: -18.0, z: -4.5, w: 20.0, d: 0.8, isHorizontal: true,
    trees: [[-26, -4.5], [-20, -4.5], [-14, -4.5], [-8, -4.5]]
  },
  {
    x: 11.0, z: -4.5, w: 20.0, d: 0.8, isHorizontal: true,
    trees: [[3, -4.5], [9, -4.5], [15, -4.5]]
  },
  {
    x: 39.5, z: -4.5, w: 19.0, d: 0.8, isHorizontal: true,
    trees: [[32, -4.5], [38, -4.5], [44, -4.5]]
  },

  // South Curb of 33' Boulevard (Facing South Blocks F, G, H, I, J)
  {
    x: -47.0, z: 5.5, w: 22.0, d: 0.8, isHorizontal: true,
    trees: [[-55, 5.5], [-49, 5.5], [-43, 5.5], [-37, 5.5]]
  },
  {
    x: -18.0, z: 5.5, w: 20.0, d: 0.8, isHorizontal: true,
    trees: [[-26, 5.5], [-20, 5.5], [-14, 5.5], [-8, 5.5]]
  },
  {
    x: 11.0, z: 5.5, w: 20.0, d: 0.8, isHorizontal: true,
    trees: [[3, 5.5], [9, 5.5], [15, 5.5]]
  },
  {
    x: 39.5, z: 5.5, w: 19.0, d: 0.8, isHorizontal: true,
    trees: [[32, 5.5], [38, 5.5], [44, 5.5]]
  }
];

// Block Borders with Landscaped Turf and Straight Upright Trees (No Bending, Kept for Every Set of Blocks)
export function BlockBordersAndAvenueTrees() {
  return (
    <group>
      {/* 1. Raised Concrete Curbs with Landscaped Turf Top along Every Block Perimeter */}
      {BLOCK_AVENUE_BORDERS.map((seg, idx) => (
        <group key={`border-${idx}`}>
          {/* Raised Kerb Stone Base (0.12m height above road level) */}
          <mesh position={[seg.x, 0.06, seg.z]}>
            <boxGeometry args={[seg.w, 0.12, seg.d]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.65} metalness={0.08} />
          </mesh>

          {/* Manicured Emerald Turf Planter Top Surface */}
          <mesh position={[seg.x, 0.122, seg.z]}>
            <boxGeometry args={[seg.isHorizontal ? seg.w : seg.w - 0.1, 0.01, seg.isHorizontal ? seg.d - 0.1 : seg.d]} />
            <meshStandardMaterial color="#68A816" roughness={0.8} />
          </mesh>

          {/* White Painted Road Margin Line on road-facing curb edge */}
          <mesh
            position={[
              seg.x,
              0.124,
              seg.z
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[seg.isHorizontal ? seg.w : 0.08, seg.isHorizontal ? 0.08 : seg.d]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.88} transparent />
          </mesh>
        </group>
      ))}

      {/* 2. Perfectly Straight, Upright Avenue Trees on the Block Borders (Kept for every set of blocks) */}
      {BLOCK_AVENUE_BORDERS.flatMap((seg, bIdx) =>
        seg.trees.map(([tx, tz], tIdx) => (
          <StraightAvenueTree
            key={`tree-${bIdx}-${tIdx}`}
            position={[tx, 0.12, tz]}
            scale={0.92}
          />
        ))
      )}
    </group>
  );
}

// Shared High-Resolution Bitumen & Cobblestone Textures with module-level caching
let asphaltTextureCache = null;
export function getAsphaltTexture() {
  if (typeof document === 'undefined') return null;
  if (asphaltTextureCache) return asphaltTextureCache;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#16191E';
  ctx.fillRect(0, 0, 256, 256);
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const rnd = Math.random();
    if (rnd > 0.82) {
      d[i] = 42; d[i + 1] = 48; d[i + 2] = 58;
    } else if (rnd > 0.45) {
      d[i] = 16; d[i + 1] = 18; d[i + 2] = 22;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  asphaltTextureCache = texture;
  return texture;
}

let cobblestoneTextureCache = null;
export function getCobblestoneTexture() {
  if (typeof document === 'undefined') return null;
  if (cobblestoneTextureCache) return cobblestoneTextureCache;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1C222A';
  ctx.fillRect(0, 0, 256, 256);
  const stoneColors = ['#758393', '#8B99A9', '#63707F', '#9BAAB9', '#586472', '#7E8C9C'];
  const rows = 8;
  const cols = 6;
  const cellH = 256 / rows;
  const cellW = 256 / cols;
  for (let r = 0; r < rows; r++) {
    const rowOffset = (r % 2) * (cellW * 0.48);
    for (let c = -1; c <= cols + 1; c++) {
      const cx = c * cellW + rowOffset;
      const cy = r * cellH;
      ctx.fillStyle = stoneColors[(r * 5 + c * 7 + 100) % stoneColors.length];
      ctx.fillRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  cobblestoneTextureCache = texture;
  return texture;
}

// Connected Road Network with Realistic Deep Asphalt, Raised Cobblestone Curbs, and Printed Road Names (Matching Image 4 & 5)
export function ConnectedRoadNetwork({ onRoadClick }) {
  const asphaltTexture = useMemo(() => getAsphaltTexture(), []);
  const cobblestoneTexture = useMemo(() => getCobblestoneTexture(), []);

  return (
    <group>
      {layoutRoads.map((road) => {
        const [p0, p1, p2, p3] = road.polygon;
        const xMin = Math.min(p0[0], p1[0], p2[0], p3[0]);
        const xMax = Math.max(p0[0], p1[0], p2[0], p3[0]);
        const zMin = Math.min(p0[1], p1[1], p2[1], p3[1]);
        const zMax = Math.max(p0[1], p1[1], p2[1], p3[1]);
        const w = xMax - xMin;
        const d = zMax - zMin;
        const cx = (xMin + xMax) / 2;
        const cz = (zMin + zMax) / 2;

        const isHighway = road.type === 'highway';
        const isArterial = road.type === 'arterial';
        const isHorizontal = w >= d;

        return (
          <group
            key={road.id}
            position={[cx, 0.05, cz]}
            onClick={(e) => {
              e.stopPropagation();
              if (onRoadClick) onRoadClick(road);
            }}
          >
            {/* Deep Rich Blacktop Asphalt Road Bed (Continuous open network) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[w, d]} />
              <meshStandardMaterial
                map={asphaltTexture || undefined}
                color="#FFFFFF"
                roughness={0.92}
                metalness={0.08}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
              />
            </mesh>

            {/* Highway Centerline: Yellow Double Median Divider (NH-765) */}
            {isHighway && (
              <group position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh position={[-0.18, 0, 0]}>
                  <planeGeometry args={[0.18, d]} />
                  <meshBasicMaterial color="#FBBF24" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
                </mesh>
                <mesh position={[0.18, 0, 0]}>
                  <planeGeometry args={[0.18, d]} />
                  <meshBasicMaterial color="#FBBF24" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
                </mesh>
              </group>
            )}

            {/* Arterial 60ft Road: White Dashed Centerline */}
            {isArterial && (
              <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[w, 0.28]} />
                <meshBasicMaterial color="#FFFFFF" opacity={0.92} transparent polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Street Name Typography printed directly on asphalt (Matching Image 5) */}
      <Text
        position={[0, 0.065, -47]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.75}
        color="#F8FAFC"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        PROP. 60'-0" WIDE ROAD
      </Text>

      <Text
        position={[73.5, 0.065, 5]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={1.6}
        color="#FEF08A"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        PROP. 33'-0" WIDE ROAD
      </Text>

      <Text
        position={[-32.5, 0.065, -20]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={1.25}
        color="#FEF08A"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        PROP. 33'-0" WIDE ROAD
      </Text>

      <Text
        position={[0, 0.065, 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.4}
        color="#CBD5E1"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        PROP. 33'-0" WIDE ROAD
      </Text>

      <Text
        position={[-32.5, 0.065, 20]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={1.25}
        color="#94A3B8"
        anchorX="center"
        anchorY="middle"
      >
        33' Road
      </Text>

      <Text
        position={[-3.5, 0.065, 20]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={1.25}
        color="#94A3B8"
        anchorX="center"
        anchorY="middle"
      >
        33' Road
      </Text>

      <Text
        position={[25.5, 0.065, 20]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={1.25}
        color="#94A3B8"
        anchorX="center"
        anchorY="middle"
      >
        33' Road
      </Text>
    </group>
  );
}

// Ac. 0.758 Park Area (matching Screenshot 3 & 4: clean flowering lawn, perimeter palms, cycad shrubs)
export function ParkArea3D({ onParkClick }) {
  const [cx, cz] = parkData.center;
  const w = parkData.width;
  const d = parkData.depth;

  // Perimeter small palm trees (matching Screenshot 3 & 4 perimeter)
  const perimeterPalms = useMemo(() => {
    const list = [];
    const minX = cx - w / 2;
    const maxX = cx + w / 2;
    const minZ = cz - d / 2;
    const maxZ = cz + d / 2;

    // North & South edges
    for (let x = minX; x <= maxX; x += 3.8) {
      list.push([x, minZ]);
      list.push([x, maxZ]);
    }
    // West & East edges
    for (let z = minZ + 3.8; z < maxZ; z += 3.8) {
      list.push([minX, z]);
      list.push([maxX, z]);
    }
    return list;
  }, [cx, cz, w, d]);

  // Scattered cycad shrubs inside the park lawn (matching Screenshot 3 & 4)
  const cycads = useMemo(() => {
    const list = [];
    const rows = 6;
    const cols = 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const jx = (((r * 13 + c * 23) % 17) - 8) * 0.35;
        const jz = (((r * 19 + c * 29) % 17) - 8) * 0.45;
        const rx = cx - w * 0.38 + (c / (cols - 1)) * (w * 0.76) + jx;
        const rz = cz - d * 0.38 + (r / (rows - 1)) * (d * 0.76) + jz;
        const sc = 0.82 + (((r * 7 + c * 11) % 5) * 0.08);
        list.push({ pos: [rx, 0.035, rz], scale: sc });
      }
    }
    return list;
  }, [cx, cz, w, d]);

  // Sprinkled white daisy & orange poppy blossoms (matching Screenshot 3 & 4)
  const flowers = useMemo(() => {
    const list = [];
    for (let i = 0; i < 72; i++) {
      const jx = (((i * 37) % 100) / 100 - 0.5) * (w * 0.88);
      const jz = (((i * 59) % 100) / 100 - 0.5) * (d * 0.88);
      list.push({ pos: [cx + jx, 0.04, cz + jz], isOrange: i % 2 === 0 });
    }
    return list;
  }, [cx, cz, w, d]);

  // Procedural Park Grass Turf Texture
  const parkGrassTexture = useMemo(() => {
    const base = getGrassTurfTexture();
    if (!base) return null;
    const tex = base.clone();
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 8);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        if (onParkClick) onParkClick();
      }}
    >
      {/* Vibrant Grass Lawn with Natural Turf Texture */}
      <mesh position={[cx, 0.03, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          map={parkGrassTexture || undefined}
          color="#72B31E"
          roughness={0.85}
        />
      </mesh>

      {/* Dark green perimeter outline */}
      <lineSegments rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.035, cz]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(w, d)]} />
        <lineBasicMaterial color="#4A7C12" linewidth={2} />
      </lineSegments>

      {/* Perimeter Straight Avenue Trees */}
      {perimeterPalms.map(([px, pz], idx) => (
        <StraightAvenueTree key={`perm-${idx}`} position={[px, 0.03, pz]} scale={0.72} />
      ))}

      {/* Scattered Cycad Palm Shrubs (matching Screenshot 3 & 4) */}
      {cycads.map((c, idx) => (
        <ParkCycadShrub key={`cycad-${idx}`} position={c.pos} scale={c.scale} />
      ))}

      {/* Scattered Daisy & Orange Flower Blossoms (matching Screenshot 3 & 4) */}
      {flowers.map((fl, idx) => (
        <FlowerPatch key={`fl-${idx}`} position={fl.pos} isOrange={fl.isOrange} />
      ))}
    </group>
  );
}

// Grand Entrance Arch connecting Layout to 60' Approach Road from Maisigandi Temple
export function GrandEntranceArch({ position = [70, 0, -47], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Left Stone Pillar */}
      <mesh position={[-4.0, 2.6, 0]}>
        <boxGeometry args={[0.9, 5.2, 0.9]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* Left Pillar Base */}
      <mesh position={[-4.0, 0.3, 0]}>
        <boxGeometry args={[1.3, 0.6, 1.3]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>
      {/* Left Pillar Cap & Gold Lamp */}
      <mesh position={[-4.0, 5.35, 0]}>
        <boxGeometry args={[1.1, 0.3, 1.1]} />
        <meshStandardMaterial color="#D97706" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Right Stone Pillar */}
      <mesh position={[4.0, 2.6, 0]}>
        <boxGeometry args={[0.9, 5.2, 0.9]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* Right Pillar Base */}
      <mesh position={[4.0, 0.3, 0]}>
        <boxGeometry args={[1.3, 0.6, 1.3]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>
      {/* Right Pillar Cap & Gold Lamp */}
      <mesh position={[4.0, 5.35, 0]}>
        <boxGeometry args={[1.1, 0.3, 1.1]} />
        <meshStandardMaterial color="#D97706" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Architectural Overhead Crossbeam */}
      <mesh position={[0, 4.9, 0]}>
        <boxGeometry args={[9.2, 0.85, 0.7]} />
        <meshStandardMaterial color="#0F172A" roughness={0.6} />
      </mesh>

      {/* Gold Decorative Header Trim */}
      <mesh position={[0, 5.4, 0]}>
        <boxGeometry args={[8.8, 0.15, 0.75]} />
        <meshStandardMaterial color="#D97706" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* "SKANDHA GROUP" Text Facing Highway (East side) */}
      <Text
        position={[0, 4.9, 0.38]}
        fontSize={0.52}
        color="#FEF08A"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        SKANDHA GROUP
      </Text>

      {/* "WELCOME TO GATED COMMUNITY" Text Facing Inside Layout (West side) */}
      <Text
        position={[0, 4.9, -0.38]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.4}
        color="#FEF08A"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        WELCOME TO SKANDHA GATED COMMUNITY
      </Text>
    </group>
  );
}



// Authoritative Regional Kadthal & Srisailam Highway Map Renderer
// Pre-paints topography with NH-765 4-lane expressway, Kadthal municipality, toll plaza, and 100' road
function paintRegionalKadthalMap(ctx, width, height) {
  // 1. Natural Land Base
  ctx.fillStyle = '#E5EAE0';
  ctx.fillRect(0, 0, width, height);

  // 2. Agricultural Farmland Patchwork (Natural cadastral patterns)
  const farmTones = ['#DFE6D6', '#E2E9D8', '#D8E2CE', '#E8EFE2', '#D3DFC8'];
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      const x = (c / 16) * width;
      const y = (r / 16) * height;
      const w = width / 16;
      const h = height / 16;
      ctx.fillStyle = farmTones[(r * 5 + c * 3) % farmTones.length];
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    }
  }

  // 3. Green Reserve Forests & Agro Green Tracts
  ctx.fillStyle = '#B4CCA4';
  ctx.beginPath();
  ctx.ellipse(520, 480, 260, 160, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(1560, 1420, 320, 200, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(1480, 780, 180, 220, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // 4. Natural Water Bodies (Cheruvu / Lakes)
  ctx.fillStyle = '#9AC3E6';
  ctx.strokeStyle = '#6E9EC9';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.ellipse(1440, 980, 115, 70, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(780, 640, 95, 55, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#2B5784';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Chellampalle Lake', 1370, 985);
  ctx.fillText('Kadthal Lake', 735, 645);

  // 5. Connecting Arterial & Regional Roads
  // Bangalore to Shadnagar Road (Crossing East-West south of site)
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(0, 1260);
  ctx.lineTo(2048, 1260);
  ctx.stroke();

  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 60' Arterial Road (East-West through Site)
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(850, 840);
  ctx.lineTo(1600, 840);
  ctx.stroke();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  // 6. Srisailam Highway (NH-765 - Major 4-Lane National Highway Corridor)
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.moveTo(1280, 0);
  ctx.quadraticCurveTo(1275, 840, 1265, 2048);
  ctx.stroke();

  // Double Yellow Median Divider
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(1278, 0);
  ctx.quadraticCurveTo(1273, 840, 1263, 2048);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1282, 0);
  ctx.quadraticCurveTo(1277, 840, 1267, 2048);
  ctx.stroke();

  // White Dashed Lane Dividers (2 lanes each direction)
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 14]);
  ctx.beginPath();
  ctx.moveTo(1273, 0);
  ctx.quadraticCurveTo(1268, 840, 1258, 2048);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1287, 0);
  ctx.quadraticCurveTo(1282, 840, 1272, 2048);
  ctx.stroke();
  ctx.setLineDash([]);

  // 7. 100 Feet Road Corridor (connecting Srisailam Highway to SITE)
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(1275, 840);
  ctx.lineTo(1210, 840);
  ctx.stroke();

  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(1275, 840);
  ctx.lineTo(1210, 840);
  ctx.stroke();
  ctx.setLineDash([]);

  // 8. Road Typography along East Road
  ctx.save();
  ctx.translate(1300, 580);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('PROP. 33\'-0" WIDE ROAD ⬆ TO HYDERABAD / ORR EXIT 14', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(1300, 1520);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('PROP. 33\'-0" WIDE ROAD ⬇ TO 4TH PHASE', 0, 0);
  ctx.restore();

  // 9. Location Landmark Badges
  // (A) Kadthal Municipality & Mandal Hq
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(660, 460, 260, 36);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.strokeRect(660, 460, 260, 36);
  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('🏛️ Kadthal Town & Municipality', 670, 484);

  // (B) Kadthal Toll Plaza
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(1150, 420, 240, 36);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.strokeRect(1150, 420, 240, 36);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('🛣️ Kadthal Toll Plaza (4 mins)', 1165, 444);

  // (C) Green Pharma City Corridor
  ctx.fillStyle = '#064E3B';
  ctx.fillRect(1420, 360, 310, 48);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.strokeRect(1420, 360, 310, 48);
  ctx.fillStyle = '#A7F3D0';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('🏭 Green Pharma City Corridor', 1430, 382);
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#D1FAE5';
  ctx.fillText('Hyderabad Pharma City (19,000+ Acres)', 1430, 400);

  // (D) Bangalore to Shadnagar Highway Connector
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(80, 1238, 280, 32);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(80, 1238, 280, 32);
  ctx.fillStyle = '#CBD5E1';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('🛣️ Bangalore to Shadnagar Road', 90, 1260);

  // (E) 100' Road Badge
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(1150, 795, 120, 26);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1150, 795, 120, 26);
  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText("100' Road to Site", 1156, 812);

  // (F) 60' Road Access Label
  ctx.fillStyle = '#047857';
  ctx.fillRect(870, 796, 215, 30);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText("PROP. 60'-0\" WIDE ROAD", 882, 816);
}

// Module-level cached texture for 3D regional map
let regionalMapTextureCache = null;

export function getRegionalMapTexture() {
  if (typeof document === 'undefined') return null;
  if (regionalMapTextureCache) return regionalMapTextureCache;

  const cvs = document.createElement('canvas');
  cvs.width = 1024;
  cvs.height = 1024;
  const ctx = cvs.getContext('2d');
  ctx.scale(0.5, 0.5);
  paintRegionalKadthalMap(ctx, 2048, 2048);

  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  regionalMapTextureCache = tex;

  return tex;
}

// Clean Master Plan 3D Ground with Regional Map and Layout-Shaped Grass Ground (Zero square shape)
export function CleanMasterPlanTerrain({ cameraPreset }) {
  // Fast procedural Bermuda grass turf texture for layout ground
  const parcelGrassTexture = useMemo(() => {
    const base = getGrassTurfTexture();
    if (!base) return null;
    const tex = base.clone();
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 12);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Regional vector map texture covering Kadthal, Srisailam Highway NH-765, and site approach
  const regionalMapTexture = useMemo(() => getRegionalMapTexture(), []);

  // Exact Layout Shape (matching DTCP brochure perimeter cuts and steps, NOT a square)
  const layoutParcelShape = useMemo(() => {
    const shape = new THREE.Shape();
    SITE_BOUNDARY_LOCAL.forEach(([x, z], idx) => {
      // In Three.js with rotation [-PI/2, 0, 0], (x, y) maps to (x, 0, -y). So y = -z.
      if (idx === 0) shape.moveTo(x, -z);
      else shape.lineTo(x, -z);
    });
    shape.closePath();
    return shape;
  }, []);

  // Surrounding Grass Buffer Shape (following the EXACT contour of the layout outward by 10m, NOT a square)
  const layoutGrassBufferShape = useMemo(() => {
    const shape = new THREE.Shape();
    LAYOUT_GRASS_BUFFER_LOCAL.forEach(([x, z], idx) => {
      if (idx === 0) shape.moveTo(x, -z);
      else shape.lineTo(x, -z);
    });
    shape.closePath();
    return shape;
  }, []);

  // Geographic plane size: 2048px * 2.285m/px = 4680m
  const groundSize = 4680;
  // Geographic offset aligning Kadthal Google Map roadmap directly with site (0,0) at 16.9530689, 78.4918425
  const shiftX = 582.7;
  const shiftZ = 149.7;

  return (
    <group>
      {/* 1. Extended Horizon Ground Plane */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[35000, 35000]} />
        <meshBasicMaterial color="#E5EAE0" />
      </mesh>

      {/* 2. Full 4.68-Kilometer High-Resolution 3D Regional Map Plane (Srisailam Highway NH-765, Kadthal Town, Pharma City) */}
      <mesh position={[shiftX, -0.015, shiftZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshBasicMaterial
          map={regionalMapTexture || undefined}
          color="#FFFFFF"
        />
      </mesh>

      {/* 3. Surrounding Natural Green Grass Buffer following the EXACT LAYOUT SHAPE (No square box!) */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[layoutGrassBufferShape]} />
        <meshStandardMaterial
          color="#7EC86E"
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>

      {/* 4. Immediate Venture Layout Ground with Lush Turf Texture following the EXACT LAYOUT SHAPE */}
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[layoutParcelShape]} />
        <meshStandardMaterial
          map={parcelGrassTexture || undefined}
          color="#68BA56"
          roughness={0.78}
        />
      </mesh>

      {/* 5. Subtle Ground Landmark Rings for Venture Center */}
      <group position={[-9, 0.025, 6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[14, 18, 32]} />
          <meshBasicMaterial color="#16A34A" transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 0]}>
          <ringGeometry args={[26, 30, 32]} />
          <meshBasicMaterial color="#22C55E" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* 6. 4th Phase road opening markers matching brochure */}
      {[
        [-61.5, 53.5], // Road V0 opening to 4th Phase
        [-32.5, 65.5], // Road V1 opening to 4th Phase
        [-3.5, 65.5],  // Road V2 opening to 4th Phase
        [25.5, 65.5],  // Road V3 opening to 4th Phase
        [53.5, 69.0]   // Road V4 opening to 4th Phase
      ].map(([px, pz], i) => (
        <group key={`phase4-3d-${i}`} position={[px, 0.038, pz]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text
            fontSize={1.2}
            color="#475569"
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
          >
            &darr; 4th Phase
          </Text>
        </group>
      ))}

      {/* Grand Entrance Arch at North-East 60' Approach Road (no plots before entrance) */}
      <GrandEntranceArch position={[70, 0, -47]} rotation={[0, 0, 0]} />
    </group>
  );
}

// Interactive Distance Measurement Line
export function MeasureOverlay({ points }) {
  if (!points || points.length === 0) return null;

  const [p1, p2] = points;
  let distanceM = 0;
  let distanceFt = 0;
  let midPoint = [0, 0, 0];

  if (p2) {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    distanceM = v1.distanceTo(v2);
    distanceFt = Math.round(distanceM * 3.28084);
    midPoint = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + 1.2, (p1[2] + p2[2]) / 2];
  }

  return (
    <group>
      <mesh position={p1}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial color="#F15A24" />
      </mesh>

      {p2 && (
        <>
          <mesh position={p2}>
            <sphereGeometry args={[0.45, 16, 16]} />
            <meshBasicMaterial color="#F15A24" />
          </mesh>
          <Line
            points={[p1, p2]}
            color="#F15A24"
            lineWidth={3}
            dashed
            dashScale={2}
          />
          <group position={midPoint} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh position={[0, 0, -0.05]}>
              <planeGeometry args={[10, 2.2]} />
              <meshBasicMaterial color="#0F172A" opacity={0.9} transparent />
            </mesh>
            <Text
              fontSize={1.1}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {`${distanceFt} ft (${distanceM.toFixed(1)} m)`}
            </Text>
          </group>
        </>
      )}
    </group>
  );
}

const Layout3DView = React.forwardRef(function Layout3DView({
  plots = [],
  selectedPlot = null,
  onSelectPlot = () => {},
  cameraPreset = 'overview',
  searchTerm = '',
  filterStatus = 'all',
  filterFacing = 'all',
  walkRoadIndex = 0,
  walkProgress = 0,
  onWalkProgressChange,
  onAzimuthChange,
  onExitWalk,
  onSwitchToMapView,
  onSwitchToOverview,
  animateVehicles = true,
  isMeasureMode = false,
  measurePoints = [],
  onMeasurePoint,
  onRoadClick,
  onParkClick
}, ref) {
  const cleanSearch = (searchTerm || '').trim();
  const bgColor = '#E5ECE3';

  return (
    <div
      className={`w-full h-full relative bg-[#E5ECE3] select-none touch-none ${cameraPreset === 'roadWalk' ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{ touchAction: 'none' }}
    >
      <Canvas
        shadows={false}
        className={cameraPreset === 'roadWalk' ? 'cursor-grab active:cursor-grabbing' : ''}
        style={{ touchAction: 'none', width: '100%', height: '100%' }}
        camera={{ position: [-9, 85, 120], fov: 42, near: 0.8, far: 45000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', logarithmicDepthBuffer: true }}
        onCreated={({ gl }) => {
          const dom = gl?.domElement;
          if (dom) {
            dom.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              console.warn('[Layout3DView] WebGL context lost prevented, auto-restoring...');
            }, false);
            dom.addEventListener('webglcontextrestored', () => {
              console.log('[Layout3DView] WebGL context restored.');
            }, false);
          }
        }}
      >
        <color attach="background" args={[bgColor]} />

        {/* Clean, Bright, Natural Illumination */}
        <ambientLight intensity={1.15} />
        <directionalLight position={[40, 80, -30]} intensity={0.7} />

        {/* Intuitive Hand-Gesture Camera Controller with Smooth Orbit, Pan & Zoom */}
        <CameraController
          selectedPlot={selectedPlot}
          cameraPreset={cameraPreset}
          walkRoadIndex={walkRoadIndex}
          walkProgress={walkProgress}
          onWalkProgressChange={onWalkProgressChange}
          onAzimuthChange={onAzimuthChange}
          onExitWalk={onExitWalk}
          onSwitchToMapView={onSwitchToMapView}
          onSwitchToOverview={onSwitchToOverview}
          apiRef={ref}
        />

        {/* Clean Master Plan Terrain matching Image 2 */}
        <CleanMasterPlanTerrain cameraPreset={cameraPreset} />

        {/* Connected Asphalt Road Network with Sidewalks & Road Labels */}
        <ConnectedRoadNetwork onRoadClick={onRoadClick} />

        {/* Ac. 0.758 Central Park with Flowering Lawn & Cycad Shrubs */}
        <ParkArea3D onParkClick={onParkClick} />

        {/* Avenue Trees on Both Sides of Every Road */}
        <BlockBordersAndAvenueTrees />

        {/* Moving Vehicles across Highway & Venture Roads */}
        <MovingVehicles3D animate={animateVehicles} />

        {/* 3D Master Plots */}
        <group>
          {plots.map((plot) => {
            const matchesSearch = !cleanSearch || String(plot.plotNumber).includes(cleanSearch);
            const matchesStatus = !filterStatus || filterStatus === 'all' || plot.status === filterStatus;
            const matchesFacing = !filterFacing || filterFacing === 'all' || (plot.facing && plot.facing.toLowerCase().includes(filterFacing.toLowerCase()));
            const isMatch = matchesSearch && matchesStatus && matchesFacing;
            const hasActiveFilter = Boolean(cleanSearch) || (filterStatus && filterStatus !== 'all') || (filterFacing && filterFacing !== 'all');
            const isDimmed = hasActiveFilter && !isMatch;
            const isSearchedMatch = Boolean(cleanSearch) && String(plot.plotNumber) === cleanSearch;

            return (
              <Plot3D
                key={plot.plotNumber}
                plot={plot}
                isSelected={selectedPlot?.plotNumber === plot.plotNumber}
                isDimmed={isDimmed}
                isSearchedMatch={isSearchedMatch}
                onSelect={onSelectPlot}
                isMeasureMode={isMeasureMode}
                onMeasurePoint={onMeasurePoint}
              />
            );
          })}
        </group>

        {/* Interactive Measure Tool Line */}
        {isMeasureMode && <MeasureOverlay points={measurePoints} />}
      </Canvas>
    </div>
  );
});

export default Layout3DView;
