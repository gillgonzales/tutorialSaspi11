import { Color, Mesh, MeshStandardMaterial, Sphere, SphereGeometry, Vector3 } from "three";
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

		const sphere_geometry = new SphereGeometry(GAME.HIT_RADIUS / 2, 64, 32);
		const sphereColor = new MeshStandardMaterial({ color: 0xffff00 });
		this.sphere = new Mesh(sphere_geometry, sphereColor);
		this.hitSphere = new Sphere(new Vector3(0, 0, 0), GAME.HIT_RADIUS)
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

	 shooting() {
		if (this.GAME.TOTAL_SHOTS > 0) {
		  if (this.shots.length > 50)
			return 0
			this.GAME.TOTAL_SHOTS--
		  const shot = {
			rx: this.model.rotation.z,
			ry: this.model.rotation.x,
			model: this.sphere.clone(),
			hit: this.hitSphere.clone(),
		  }
		  shot.hit.radius = this.GAME.HIT_RADIUS / 2
		  shot.model.material.transparent = true
		  shot.model.material.opacity = .5
		  shot.model.material.emissive = new Color(0xffff00)
		  shot.model.material.roughness = .5
		  shot.model.material.metalness = 1
		  shot.model.position.set(...this.model.position)
		  shot.hit.center.copy(shot.model.position)
		  this.GAME.scene.add(shot.model)
		  this.shots.push(shot)
		} else {
		  console.warn("ACABOU A MUNIÇÃO!!!")
		}
	  }

	  updateShots() {
		if (this.shots.length == 0) return 0
		this.shots.forEach((shot) => {
		  shot.model.position.z -= 1
		  shot.model.position.x += -shot.rx / 2
		  shot.model.position.y += shot.ry / 5
		  shot.hit.center.copy(shot.model.position)
		})
	  
		this.shots = this.shots.filter((shot) => {
		  if (shot.model.position.z < -150) {
			this.GAME.scene.remove(shot.model)
			return false
		  }
		  return true
		})
	  }

	  shootDown(enemy) {
		if (this.shots.length == 0) return false;
		return this.shots.find(shot => shot.hit.intersectsSphere(enemy.hit))
	  }
}