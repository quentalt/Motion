// App.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Pill = ({ position, isRolling }: { position: [number, number, number], isRolling: boolean }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (isRolling && ref.current) {
      ref.current.rotation.z += 0.05; // Adjust the rotation speed as needed
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[0, -1, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
};

const Ball = ({ initialPosition, isSplit, startMoving }: { initialPosition: [number, number, number], isSplit: boolean, startMoving: boolean }) => {
  const ref = useRef<THREE.Mesh>(null);
  const [angle, setAngle] = useState(0);
  const [position, setPosition] = useState(initialPosition);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [isMoving, setIsMoving] = useState(false);
  const [falling, setFalling] = useState(true);

  useEffect(() => {
    if (startMoving) {
      setIsMoving(true);
      setFalling(false);
    }
  }, [startMoving]);

  useFrame(() => {
    if (ref.current) {
      if (falling) {
        // Simulate falling movement
        setPosition([position[0], position[1] - 0.05, position[2]]); // Adjust the falling speed
        if (position[1] <= 0) {
          setFalling(false);
          
        }
      } else if (isMoving) {
        // Simulate rolling movement
        setAngle(angle + 0.05); // Adjust this value to control the rolling speed
        const newX = initialPosition[0] + Math.cos(angle) * direction; // Adjust for simulating movement on the cylinder
        const newZ = initialPosition[2] + Math.sin(angle) * direction; // Adjust for simulating movement on the cylinder
        setPosition([newX, 0, newZ]);

        // Make the balls rejoin after rolling movement
        if (Math.abs(newX) < 0.5) { // Adjusted condition to make the balls rejoin
          setIsMoving(false); // Stop movement to simulate the balls have rejoined
        }

        // Check for collision with the other ball (optional, depending on your scene setup)
        if (isSplit && Math.abs(newX) > 1.5) {
          setDirection(-direction); // Change direction when colliding with the other ball
        }
      }
      ref.current.position.set(position[0], position[1], position[2]);
    }
  });

  return (
    <mesh ref={ref} position={initialPosition}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={isSplit ? "green" : "red"} />
    </mesh>
  );
};

const Scene = () => {
  const [split, setSplit] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const handleSplit = () => {
    setSplit(true);
    setTimeout(() => {
      setIsMoving(true);
      setIsRolling(true);
    }, 1000); // Delay before balls start moving horizontally and cylinders start rolling
  };

  useEffect(() => {
    setTimeout(handleSplit, 2000); // Automatically trigger the split after 2 seconds
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Pill position={[-1.5, 0, 0]} isRolling={isRolling} />
      <Pill position={[1.5, 0, 0]} isRolling={isRolling} />
      {!split ? (
        <Ball initialPosition={[0, 1, 0]} isSplit={false} startMoving={isMoving} />
      ) : (
        <>
          <Ball initialPosition={[-1.5, 1, 0]} isSplit={true} startMoving={isMoving} />
          <Ball initialPosition={[1.5, 1, 0]} isSplit={true} startMoving={isMoving} />
        </>
      )}
      <OrbitControls />
    </>
  );
};

const App = () => {
  return (
    <Canvas>
      <Scene />
    </Canvas>
  );
};

export default App;
