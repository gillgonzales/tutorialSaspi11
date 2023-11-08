import Model3D from "./Model3D";
let that; 
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

	updateJoystick(event) {
		console.log(event)
		if (!event.buttons) {
			this.joystick.x = event.clientX
			this.joystick.y = event.clientY
		} else {
			this.joystick.x = null
			this.joystick.y = null
		}
	  }
}