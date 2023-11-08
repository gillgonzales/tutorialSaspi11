import Model3D from "./Model3D";

export default class Airplane extends Model3D {
	constructor(modelPath, mtlFile, objFile, GAME) {
		super(modelPath, mtlFile, objFile)

		this.GAME = GAME

		this.joystick = { x: null, y: null }
		this.shots = new Array()

		this.create(GAME.scene).then(() => {
			this.model.scale.setScalar(.5)//redimensiona o objeto
			this.model.position.y = -.2
			this.GAME.camera.position.y = -this.model.position.y+.2
		})
	}
}