import { Billboard } from "@react-three/drei";
const LockIcon = ({ position, texture }) => {
	return (
		<group
			position={[position[0], position[1] + 1, position[2]]}
			rotation={[-Math.PI / 2, 0, 0]}
		>
			<mesh scale={0.13}>
				<planeGeometry />
				<meshBasicMaterial map={texture} transparent depthWrite={false} />
			</mesh>
		</group>
	);
};

export default LockIcon;
