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

	updateJoystick(event) {
		if (!event.buttons) {
			this.joystick.x = event.clientX
			this.joystick.y = event.clientY
		} else {
			this.joystick.x = null
			this.joystick.y = null
		}
	  }

	 moveJet() {
		if (this.model
		  && this.joystick.x
		  && this.joystick.y) {
	  
		  let wh = window.innerHeight
		  let ww = window.innerWidth
	  
		  this.model.rotation.x += (this.joystick.y - wh / 2) / wh / 100
	  
		  if (Math.abs(this.model.position.x) > 1) {
			this.model.position.x = this.model.position.x / Math.abs(this.model.position.x)
		  } else {
			this.model.rotation.z -= (this.joystick.x - ww / 2) / ww / 10
		  }
	  
		  if (Math.abs(this.model.rotation.z) != 0) {
			this.model.position.x += (this.joystick.x - ww / 2) / ww / 10
			this.model.rotation.y = this.model.rotation.z / 2.5
		  }
	  
		  if (Math.abs(this.model.rotation.y) > .5)
			this.model.rotation.y = .5 * (this.model.rotation.y / Math.abs(this.model.rotation.y))
		}
	  }
}