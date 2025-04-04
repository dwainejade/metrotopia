import React from "react";

const Tile = ({
	position,
	scale,
	onClick,
	texture,
	userData,
	opacity = 1, // Add default opacity
}) => {
	return (
		<mesh
			position={position}
			rotation={[-Math.PI / 3.3, 0, 0]}
			onClick={onClick}
			userData={userData}
			scale={scale}
		>
			<planeGeometry />
			<meshBasicMaterial
				map={texture}
				transparent
				depthWrite={false}
				opacity={opacity}
			/>
		</mesh>
	);
};

export default Tile;
