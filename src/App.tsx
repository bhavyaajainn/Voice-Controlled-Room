import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import fuzzysort from "fuzzysort";

const VoiceController: React.FC<{ onCommand: (cmd: string) => void }> = ({
  onCommand,
}) => {
  useEffect(() => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const text = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();
      onCommand(text);
    };

    recognition.start();
    return () => recognition.stop();
  }, [onCommand]);

  return null;
};

const Lamp: React.FC<{ isOn: boolean }> = ({ isOn }) => {
  const headRef = useRef<THREE.Group | null>(null);

  useFrame(() => {
    if (headRef.current) {
      headRef.current.rotation.z +=
        ((isOn ? -0.4 : 0) - headRef.current.rotation.z) * 0.1;
    }
  });

  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.1, 1.2, 0.1]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      <group ref={headRef} position={[0, 1.4, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 0.2, 0.4]} />
          <meshStandardMaterial color={isOn ? "#ffeb3b" : "#888"} />
        </mesh>

        {isOn && (
          <spotLight
            position={[0, 0, 0.3]}
            angle={0.5}
            intensity={2}
            distance={6}
            color={"#fff176"}
            penumbra={0.3}
            castShadow
          />
        )}
      </group>
    </group>
  );
};

const AirConditioner: React.FC<{ isOn: boolean }> = ({ isOn }) => {
  return (
    <group position={[2.5, 1.5, 0]}>
      <mesh>
        <boxGeometry args={[1.5, 0.6, 0.4]} />
        <meshStandardMaterial color={isOn ? "#2e7d32" : "#333"} />
      </mesh>

      <Text position={[0, 0, 0.21]} fontSize={0.15} color="white">
        AC
      </Text>

      <mesh position={[0.5, 0, 0.25]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial
          color={isOn ? "#2e7d32" : "red"}
          emissive={isOn ? "#81d4fa" : "black"}
          emissiveIntensity={isOn ? 1.5 : 0}
        />
      </mesh>

      {isOn && (
        <spotLight
          position={[1.5, -0.5, -1.5]}
          angle={0.9}
          intensity={3}
          distance={8}
          color={"#81d4fa"}
          penumbra={0.5}
          castShadow
        />
      )}
    </group>
  );
};

const Fridge: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const hingeRef = useRef<THREE.Group | null>(null);
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(new THREE.Object3D());

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, [isOpen]);

  useFrame(() => {
    if (hingeRef.current) {
      const targetRotation = isOpen ? -Math.PI / 4 : 0;
      hingeRef.current.rotation.y +=
        (targetRotation - hingeRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <group position={[-2.5, 0.8, 0]}>
      <mesh>
        <boxGeometry args={[0.8, 1.6, 0.6]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      <group ref={hingeRef} position={[-0.4, 0, 0]}>
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.1, 1.5, 0.6]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>

      <primitive object={targetRef.current} position={[0, 0, 0]} />

      {isOpen && (
        <spotLight
          ref={lightRef}
          position={[0, 0, 2]}
          angle={0.6}
          intensity={2.5}
          distance={6}
          penumbra={0.5}
          color="#66bb6a"
          castShadow
        />
      )}
    </group>
  );
};

const DiscoLight: React.FC<{ isOn: boolean }> = ({ isOn }) => {
  const redRef = useRef<THREE.SpotLight>(null);
  const greenRef = useRef<THREE.SpotLight>(null);
  const blueRef = useRef<THREE.SpotLight>(null);
  const discoBallRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!isOn) return;
    timeRef.current += delta;

    if (discoBallRef.current) {
      discoBallRef.current.rotation.y += isOn ? 0.1 : 0.01;
    }    

    const radius = 6;
    if (redRef.current)
      redRef.current.position.set(
        Math.sin(timeRef.current * 1.5) * radius,
        3,
        Math.cos(timeRef.current * 1.5) * radius
      );
    if (greenRef.current)
      greenRef.current.position.set(
        Math.sin(timeRef.current * 2) * radius,
        3,
        Math.cos(timeRef.current * 2) * radius
      );
    if (blueRef.current)
      blueRef.current.position.set(
        Math.sin(timeRef.current * 2.5) * radius,
        3,
        Math.cos(timeRef.current * 2.5) * radius
      );
  });

  return (
    <>
      {/* Always render disco ball */}
      <mesh ref={discoBallRef} position={[0, 3, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="silver"
          metalness={1}
          roughness={0.2}
          emissive="#555"
          emissiveIntensity={0.5}
        />
      </mesh>
      {isOn && (
        <>
          <spotLight ref={redRef} angle={1} intensity={15} color="red" distance={30} penumbra={1} castShadow />
          <spotLight ref={greenRef} angle={1} intensity={15} color="green" distance={30} penumbra={1} castShadow />
          <spotLight ref={blueRef} angle={1} intensity={15} color="blue" distance={30} penumbra={1} castShadow />
        </>
      )}
    </>
  );
  
};

const LampScene: React.FC = () => {
  const [command, setCommand] = useState("");
  const [lampOn, setLampOn] = useState(false);
  const [acOn, setAcOn] = useState(false);
  const [fridgeOpen, setFridgeOpen] = useState(false);
  const [powerOn, setPowerOn] = useState(false);
  const [discoOn, setDiscoOn] = useState(false);

  useEffect(() => {
    setLampOn(powerOn);
    setAcOn(powerOn);
    setFridgeOpen(powerOn);
    setDiscoOn(powerOn);
  }, [powerOn]);

  const validCommands = [
    "switch lamp on",
    "switch on lamp",
    "lamp on",
    "sweet lamp on",
    "swich lamp on",
    "switch the lamp on",
    "switch lamp off",
    "lamp off",
    "switch off lamp",
    "sweet lamp off",
    "swich lamp off",
    "switch the lamp off",
    "open ac",
    "switch ac on",
    "ac on",
    "start ac",
    "essay on",
    "ac start",
    "enable ac",
    "power on ac",
    "ac off",
    "switch ac off",
    "close ac",
    "stop ac",
    "essay off",
    "disable ac",
    "power off ac",
    "open fridge",
    "start fridge",
    "activate fridge",
    "close fridge",
    "shut fridge",
    "stop fridge",
    "close bridge",
    "open bridge",
    "power on",
    "turn everything on",
    "power off",
    "turn everything off",
    "disco light on",
    "disco light off",
  ];

  const handleCommand = (raw: string) => {
    setCommand(raw);
    const result = fuzzysort.go(raw, validCommands, { threshold: -100 });
    if (result.length > 0) {
      const best = result[0].target;

      if (best.includes("power") && best.includes("on")) {
        if (!powerOn) setPowerOn(true);
        return;
      } else if (best.includes("power") && best.includes("off")) {
        if (powerOn) setPowerOn(false);
        return;
      }

      if (best.includes("lamp") && best.includes("on")) setLampOn(true);
      else if (best.includes("lamp") && best.includes("off")) setLampOn(false);
      else if (best.includes("ac") && best.includes("on")) setAcOn(true);
      else if (
        best.includes("ac") &&
        (best.includes("off") ||
          best.includes("close") ||
          best.includes("stop") ||
          best.includes("disable"))
      )
        setAcOn(false);
      else if (
        best.includes("fridge") &&
        (best.includes("open") ||
          best.includes("start") ||
          best.includes("activate"))
      ) {
        setFridgeOpen(true);
      } else if (
        best.includes("fridge") &&
        (best.includes("close") ||
          best.includes("shut") ||
          best.includes("stop"))
      ) {
        setFridgeOpen(false);
      } else if (
        best.includes("disco") &&
        best.includes("light") &&
        best.includes("on")
      ) {
        setDiscoOn(true);
      } else if (
        best.includes("disco") &&
        best.includes("light") &&
        best.includes("off")
      ) {
        setDiscoOn(false);
      }
    }
  };

  return (
    <div style={{ height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <VoiceController onCommand={handleCommand} />

      <Canvas shadows camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <OrbitControls />

        <Lamp isOn={lampOn} />
        <AirConditioner isOn={acOn} />
        <Fridge isOpen={fridgeOpen} />
        <DiscoLight isOn={discoOn} />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.01, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#bbb" />
        </mesh>
      </Canvas>

      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(255,255,255,0.9)",
          padding: "15px 20px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          minWidth: "260px",
        }}
      >
        <h3 style={{ margin: "0 0 10px", fontSize: "1.2rem" }}>
          🎙️ Last Command:
        </h3>
        <p style={{ margin: 0, fontSize: "1.1rem" }}>
          <strong>{command || "Waiting..."}</strong>
        </p>
        <hr style={{ margin: "10px 0" }} />
        <p style={{ fontSize: "0.95rem", margin: 0 }}>Say:</p>
        <ul style={{ paddingLeft: 18, marginTop: 4, marginBottom: 0 }}>
          <li>“Switch lamp on/off”</li>
          <li>“Open AC” / “Start AC” / “Essay on”</li>
          <li>“Close AC” / “AC off” / “Essay off”</li>
          <li>“Open Fridge” / “Close Fridge”</li>
          <li>“Disco light on” / “Disco light off”</li>
          <li>“Power on” / “Power off”</li>
        </ul>
      </div>

      <div
        onClick={() => setPowerOn((prev) => !prev)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 50,
          height: 50,
          backgroundColor: "#111", // black box
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          cursor: "pointer",
        }}
        title="Toggle Power"
      >
        <div
          style={{
            width: 20,
            height: 20,
            backgroundColor: powerOn ? "#4caf50" : "#f44336", // green or red
            borderRadius: "50%",
            boxShadow: powerOn ? "0 0 8px #4caf50" : "0 0 8px #f44336",
            transition: "background-color 0.3s ease",
          }}
        />
      </div>
    </div>
  );
};

export default LampScene;
