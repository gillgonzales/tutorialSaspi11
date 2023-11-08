import * as THREE from 'three'
import SkyBox from './classes/SkyBox'
import TextureAnimator from './classes/TextureAnimator'
import Model3D from './classes/Model3D';
import Airplane from './classes/Airplane';

const GAME = {
	QTD_ENEMIES:  5,
	HIT_RADIUS:   .125,
	TOTAL_SHOTS:  1000,
	GAME_OVER:    false,
  LOST_ENEMIES: 0,
	SCORE:        0
}

GAME.renderer = new THREE.WebGLRenderer({ antialias: true })
GAME.renderer.setSize(window.innerWidth, window.innerHeight)
document.querySelector('#game').appendChild(GAME.renderer.domElement)

GAME.scene = new THREE.Scene()
GAME.scene.background = new THREE.Color(0x000000)

GAME.camera = new THREE.PerspectiveCamera(
  40, //campo de visao vertical 
  window.innerWidth / window.innerHeight, //aspecto da imagem (Largura/Altura)
  0.1, //Plano proximo
  1000 //Plano distante
);
GAME.camera.position.set(0, .25, 2)

GAME.skyBox = new SkyBox('bluesky', 200)
await GAME.skyBox.create(GAME.scene);

const modelsPath = 'models/f15c/'

const jet = new Airplane(modelsPath,'f15c.mtl','f15c.obj',GAME)

GAME.light = new THREE.AmbientLight(0xffffff, 10);
GAME.scene.add(GAME.light);

GAME.plight = new THREE.PointLight(0xffffff, 500, 50,.5);
GAME.plight.position.set(0, 25, 10);
GAME.scene.add(GAME.plight);

const enemyModel = new Model3D(modelsPath,'f15c_e.mtl','f15c.obj')
const enemy = await enemyModel.create(GAME.scene)
enemy.scale.setScalar(.5)
enemy.position.y = .4
enemy.rotateY(3.14)
// enemy.position.z = -1
// scene.add(enemy)

const hitSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), GAME.HIT_RADIUS)

const explosionTexture = new THREE.TextureLoader().load('img/textures/explosion.png');
const explosionlight = new THREE.PointLight(0xff3300, 1, 5);

const enemies = createEnemies()

function createEnemies() {
  let distance = 100
  let horizontalLimit = 5
  return Array.from({ length: GAME.QTD_ENEMIES }).map(() => {
    let texture = explosionTexture.clone();
    texture.needsUpdate = true;
    let explodeMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    let exploGeo = new THREE.PlaneGeometry(4, 4, 1, 1);
    

    enemy.position.z = -(Math.random() * distance + distance)
    enemy.position.x = (Math.random() * (Math.random() > .5 ? 1 : -1));
    enemy.position.x *= horizontalLimit
    
    let hitArea = hitSphere.clone()
    hitArea.radius = hitArea.radius * 2

    let enemyClone = {
      model: enemy.clone(),
      hit: hitArea,
      dead: false,
      explosion:{
        sprite: new TextureAnimator(texture, 8, 6, 48, 50, THREE),
        model: new THREE.Mesh(exploGeo, explodeMaterial),
      }
    }
    GAME.scene.add(enemyClone.model)
    return enemyClone
  })
}

function showEnemyHit(enemy) {
  enemy.explosion.model.position.copy(enemy.model.position.clone())
  explosionlight.position.copy(enemy.model.position.clone())
  enemy.explosion.model.scale.setScalar(1.5)
  GAME.scene.add(explosionlight);
  GAME.scene.add(enemy.explosion.model);
  enemy.dead = true
}

function moveEnemy(enemy) {
  let velocity = .16
  let distance = enemy.model.position.z
  if (!enemy.dead) {
    if (distance > 30) {
      GAME.LOST_ENEMIES++
      console.warn('Inimigos perdidos:',GAME.LOST_ENEMIES)
      enemy.model.position.z = -(Math.random() * 100 + 100)
      enemy.model.position.x = Math.random() * (Math.random() > .5 ? 5 : -5);
    } else if (distance > -40) {
      velocity += .48
    } else if (distance > -30) {
      velocity += .32
    } else if (distance > -10) {
      velocity += .24
    }
    enemy.model.position.z += velocity
    enemy.hit.center.copy(enemy.model.position)
  }else {
    enemy.model.position.z = 1000
    enemy.explosion.model.position.z += .05
    enemy.explosion.model.position.y -= .005
    if (enemy.explosion.sprite.currentTile < enemy.explosion.sprite.numberOfTiles - 1) {
      enemy.explosion.sprite.update(20)
    } else {
      GAME.scene.remove(enemy.explosion.model);
      enemy.dead = false
      enemy.model.position.z = -(Math.random() * 100 + 100)
      enemy.explosion.sprite.reset()
    }
  }
}

function isFinish() {
  if (GAME.LOST_ENEMIES > 2 * GAME.QTD_ENEMIES || GAME.TOTAL_SHOTS <= 0) {
    console.error('GAMEOVER!!!', GAME.SCORE, GAME.TOTAL_SHOTS, GAME.LOST_ENEMIES)
    console.table({
      'PONTOS': GAME.SCORE,
      'MUNIÇÃO': GAME.TOTAL_SHOTS,
      'INIMIGOS PERDIDOS': GAME.LOST_ENEMIES
    })
    showModal()
    return true
  }
  return false
}

function showModal(){
  //mostra modal de statisticas
  document.querySelector('#stats-modal').style.display='block'
  document.querySelector('#stats-results').innerHTML=`
    PONTOS: ${GAME.SCORE} | MUNIÇÃO: ${GAME.TOTAL_SHOTS} | INIMIGOS PERDIDOS: ${GAME.LOST_ENEMIES}`
}

const gameLoop = () => {
  GAME.skyBox.model.rotation.y += .0001
  GAME.skyBox.model.position.z += .0001
  jet.moveJet()
  jet.updateShots()
  enemies.forEach((e) =>{ 
    moveEnemy(e)
    if(!e.dead && jet.shootDown(e)){
      showEnemyHit(e)
      GAME.SCORE+=10
      console.info('Pontos:',GAME.SCORE)
    }
  })
  GAME.renderer.render(GAME.scene, GAME.camera)
  GAME.GAME_OVER = isFinish()
  !GAME.GAME_OVER && requestAnimationFrame(gameLoop)
}

window.addEventListener('mousemove',e=>jet.updateJoystick(e))
window.addEventListener('click', e=>jet.shooting());
window.addEventListener('keydown', event =>{
  GAME.GAME_OVER && showModal()
  GAME.KEY = event.key
  return (
      (  GAME.KEY == ' ' 
      || GAME.KEY == 'Enter')
      && !GAME.GAME_OVER
      && jet.shooting()
    )
});

gameLoop()