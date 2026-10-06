import { ARENA } from '../data/config';
import { CREATURES, type CreatureId } from '../data/creatures';
import { ENEMIES, type EnemyId } from '../data/enemies';
import { HEROES, type HeroId } from '../data/heroes';
import type { GameEvent } from '../game/events';
import type { Point } from '../game/state';
import { drawSprite } from './sprites';
import { drawLayered } from './spriteKit';

const TAU = Math.PI * 2;
const GOLD = '#ffd25a';

/** Cores do Pulso de cada herói. */
const PULSE_LOOK: Record<HeroId, { ring: string; inner: string; particle: string }> = {
  archangel: { ring: '#fff6c0', inner: '#ffffff', particle: '#ffe9a8' },
  archdemon: { ring: '#ff4a2a', inner: '#ffd25a', particle: '#ff8a2a' },
  gorgonQueen: { ring: '#ffd25a', inner: '#c8ff6a', particle: '#9a9a9a' },
  deathLord: { ring: '#7affb0', inner: '#1e2e28', particle: '#9affc8' },
  colossus: { ring: '#c8a070', inner: '#7affd8', particle: '#8a7a60' },
  faeQueen: { ring: '#ff8ad0', inner: '#ffffff', particle: '#ffd0f4' },
  knight: { ring: '#c08cff', inner: '#ffffff', particle: '#c99bff' },
  vampireLord: { ring: '#ff3a50', inner: '#2a1040', particle: '#3a1a50' },
  draconian: { ring: '#ff8a2a', inner: '#ffd25a', particle: '#ff5a1a' },
  lycan: { ring: '#e8c890', inner: '#ffffff', particle: '#c8a070' },
  specter: { ring: '#8ce8d8', inner: '#e8fffc', particle: '#5ab8a8' },
  witch: { ring: '#7ad85a', inner: '#2a5a1a', particle: '#a8f080' },
};

/** Golpes corpo a corpo (corte sobre o alvo) e a cor do corte. */
const MELEE: Partial<Record<CreatureId, string>> = {
  duelist: '#ff3a50',
  guard: '#e8f6ff',
  hunter: '#f0e0c0',
  alpha: '#ffd8a0',
};

/** Tiros de inimigos: flecha, raio do Lich e teia. */
type EnemyShotKind = 'enemyArrow' | 'enemyBolt' | 'web' | 'curse' | 'acid' | 'snowball';

interface Shot {
  source: CreatureId | 'hero' | EnemyShotKind;
  /** Cor do corte (golpes do herói). */
  color?: string;
  from: Point;
  to: Point;
  duration: number;
  remaining: number;
  trailTimer: number;
}

interface Wave extends Point {
  angle: number;
  halfAngle: number;
  range: number;
  life: number;
  maxLife: number;
}

interface Particle extends Point {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
  /** Mistura aditiva (brilho). */
  glow: boolean;
}

interface Ring extends Point {
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  width: number;
}

interface Corpse extends Point {
  enemy: EnemyId;
  life: number;
  maxLife: number;
}

interface FloatingText extends Point {
  text: string;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

/** Raio em linha de uma criatura (Cristal, Valquíria...). */
interface Beam {
  from: Point;
  to: Point;
  width: number;
  color: string;
  life: number;
  maxLife: number;
}

/** Raio do Nexus: zigue-zague curto do cristal até o alvo. */
interface Bolt {
  from: Point;
  to: Point;
  life: number;
  maxLife: number;
  seed: number;
}

interface Banner {
  text: string;
  subtitle: string;
  color: string;
  life: number;
  maxLife: number;
}

const random = (min: number, max: number) => min + Math.random() * (max - min);

/** Efeitos puramente visuais, alimentados pelos eventos da simulação. */
export class Effects {
  private shots: Shot[] = [];
  private particles: Particle[] = [];
  private rings: Ring[] = [];
  /** Posição do Nexus na run atual (efeitos do Nexus saem daqui). */
  nexusAt: { x: number; y: number } = { ...ARENA.center };
  private waves: Wave[] = [];
  private corpses: Corpse[] = [];
  private texts: FloatingText[] = [];
  private banners: Banner[] = [];
  private bolts: Bolt[] = [];
  private beams: Beam[] = [];
  private shake = 0;
  /** 1 logo após o Nexus levar dano, caindo até 0. */
  nexusHurt = 0;
  /** Números de dano flutuando (opção nas Configurações). */
  showDamageNumbers = true;

  clear(): void {
    this.shots = [];
    this.particles = [];
    this.rings = [];
    this.waves = [];
    this.corpses = [];
    this.texts = [];
    this.banners = [];
    this.bolts = [];
    this.beams = [];
    this.shake = 0;
    this.nexusHurt = 0;
  }

  handle(event: GameEvent): void {
    switch (event.type) {
      case 'shot': {
        const melee = MELEE[event.source];
        const duration = melee ? 0.16 : event.source === 'cauldron' ? 0.4 : event.source === 'batSwarm' ? 0.32 : 0.22;
        this.shots.push({ ...event, duration, remaining: duration, trailTimer: 0, color: melee });
        break;
      }
      case 'heroAttack': {
        const color = HEROES[event.hero].color;
        if (event.cone === null) {
          const slash = event.hero === 'knight' ? '#e8f6ff' : color;
          this.shots.push({ source: 'hero', from: event.from, to: event.to, duration: 0.16, remaining: 0.16, trailTimer: 1, color: slash });
          break;
        }
        // leque de fogo: partículas espalhadas dentro do cone
        const aim = Math.atan2(event.to.y - event.from.y, event.to.x - event.from.x);
        for (let i = 0; i < 18; i++) {
          const a = aim + random(-event.cone, event.cone);
          const speed = random(event.range * 2, event.range * 3.4);
          this.particles.push({
            x: event.from.x,
            y: event.from.y - 6,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            life: 0.3,
            maxLife: 0.3,
            size: random(2, 3.5),
            color: Math.random() < 0.5 ? '#ffb040' : color,
            gravity: 0,
            glow: true,
          });
        }
        break;
      }
      case 'enemyShot': {
        const source: EnemyShotKind = event.kind === 'arrow' ? 'enemyArrow' : event.kind === 'bolt' ? 'enemyBolt' : event.kind;
        const duration = event.kind === 'web' ? 0.3 : 0.25;
        this.shots.push({ source, from: event.from, to: event.to, duration, remaining: duration, trailTimer: 0 });
        break;
      }
      case 'enemySummoned':
        this.ring(event.x, event.y + 10, 24, event.color, 0.5, 2.5);
        this.burst(event.x, event.y + 8, 12, event.color, 50, 0.6, 2.2, true, -30);
        this.burst(event.x, event.y + 10, 6, '#4a3a2a', 40, 0.5, 3, false, -20, 120);
        break;
      case 'guardHit':
        this.text(event.x, event.y - 50, `-${event.damage}`, '#ffb84a', 11);
        break;
      case 'guardDestroyed':
        this.ring(event.x, event.y, 70, '#ff5a5a', 0.8, 5);
        this.burst(event.x, event.y - 16, 30, '#ffd25a', 130, 0.8, 3, true);
        this.banner(`${event.name} caiu!`, '', '#ff5a5a', 2.2);
        this.shake = Math.max(this.shake, 10);
        break;
      case 'caravanMoved':
        this.banner('A caravana avançou', 'Nova parada · reposicione a defesa se precisar', '#ffd25a', 2.2);
        this.ring(event.to.x, event.to.y, 60, '#ffd25a', 0.7, 3);
        break;
      case 'iceCracked':
        this.burst(event.x, event.y, 10, '#d8f0ff', 60, 0.5, 2, false, -10, 100);
        break;
      case 'enemyFell':
        this.ring(event.x, event.y, 16, '#5a9ad0', 0.5, 2);
        this.burst(event.x, event.y, 12, '#8ac8f0', 70, 0.5, 2, false, -40, 160);
        this.text(event.x, event.y - 16, 'Caiu no gelo!', '#bfe4ff', 9);
        break;
      case 'creatureFrozen':
        this.burst(event.x, event.y - 8, 10, '#bfe8ff', 50, 0.5, 2, true);
        break;
      case 'wyrmSurfaced':
        this.ring(event.x, event.y, event.radius, '#bfe8ff', 0.7, 5);
        this.burst(event.x, event.y, 30, '#e8f8ff', 140, 0.8, 3, false, -60, 200);
        this.shake = Math.max(this.shake, 9);
        break;
      case 'avalancheWarning':
        this.banner('Avalanche!', `desce pela passagem em ${event.seconds} s · saia do caminho`, '#ff8a8a', 2.4);
        break;
      case 'avalancheEnded':
        this.shake = Math.max(this.shake, 4);
        break;
      case 'pulseReady':
        this.ring(event.x, event.y + 6, 34, '#e2c8ff', 0.6, 3);
        this.burst(event.x, event.y - 10, 10, '#e2c8ff', 50, 0.6, 2, true, -40);
        this.text(event.x, event.y - 34, 'Pulso pronto!', '#e2c8ff', 10);
        break;
      case 'weatherWarning':
        this.banner('Nevasca chegando', `em ${event.seconds} s · fique perto das fogueiras`, '#bfe4ff', 2.2);
        break;
      case 'weatherStarted':
        this.banner(event.forced ? 'Nevasca Eterna' : 'Nevasca!', 'Alcance −30% longe das fogueiras · reacenda com o herói', '#e8f4ff', 2.4);
        break;
      case 'weatherEnded':
        this.banner('A nevasca passou', '', '#bfe4ff', 1.4);
        break;
      case 'interactableActivated':
        this.ring(event.x, event.y - 10, 30, '#ffb85a', 0.6, 3);
        this.burst(event.x, event.y - 14, 14, '#ffd27a', 60, 0.6, 2.2, true, -40);
        this.text(event.x, event.y - 32, 'Fogueira acesa!', '#ffd27a', 10);
        break;
      case 'enemyLeap':
        this.burst(event.x, event.y + 10, 8, '#6a5a3a', 50, 0.4, 2.4, false, -10, 100);
        break;
      case 'creatureSwallowed':
        this.ring(event.x, event.y + 6, 22, '#9aba4a', 0.5, 3);
        this.burst(event.x, event.y, 14, '#bada9a', 70, 0.5, 2.2, true);
        this.text(event.x, event.y - 22, 'Engolida!', '#bada9a', 10);
        break;
      case 'creatureReleased':
        this.burst(event.x, event.y, 16, '#9aba4a', 80, 0.5, 2.4, false, -20, 120);
        break;
      case 'enemyBurrow':
        this.ring(event.x, event.y + 8, event.surfacing ? 40 : 26, '#a89060', 0.6, 3);
        this.burst(event.x, event.y + 8, event.surfacing ? 22 : 12, '#5a4a2a', 90, 0.6, 3, false, -30, 160);
        if (event.surfacing) this.shake = Math.max(this.shake, 5);
        break;
      case 'headCut':
        this.burst(event.x, event.y - 20, 22, '#4a9a6a', 110, 0.6, 3, false, -40, 200);
        this.text(event.x, event.y - 46, event.heads > 1 ? `Cabeça cortada! (${event.heads})` : 'Última cabeça!', '#ffb84a', 11);
        this.shake = Math.max(this.shake, 4);
        break;
      case 'headsRegrown':
        this.ring(event.x, event.y - 10, 50, '#9aff5a', 0.7, 4);
        this.text(event.x, event.y - 46, `Cabeças renasceram! (${event.heads})`, '#9aff5a', 11);
        break;
      case 'enemyCharge':
        this.burst(event.x, event.y + 8, 8, '#9ae8ff', 50, 0.4, 2, true);
        break;
      case 'enemyHealed':
        this.ring(event.x, event.y, event.radius, '#7affb0', 0.6, 2);
        this.burst(event.x, event.y - 6, 10, '#9affc8', 50, 0.7, 2, true, -40);
        break;
      case 'stomp':
        this.ring(event.x, event.y + 12, event.radius, '#e8c890', 0.5, 5);
        this.burst(event.x, event.y + 12, 18, '#8a7a5a', 90, 0.6, 3, false, -20, 160);
        this.shake = Math.max(this.shake, 6);
        break;
      case 'bossShield':
        this.ring(event.x, event.y - 8, 40, '#7af0d8', 0.5, 3);
        this.text(event.x, event.y - 50, 'Escudo!', '#7af0d8', 11);
        break;
      case 'bossEnraged':
        this.ring(event.x, event.y, 60, '#ff2a3a', 0.8, 5);
        this.burst(event.x, event.y - 10, 30, '#ff3a4a', 120, 0.8, 3, true);
        this.banner(`${ENEMIES[event.enemy].name} enfurecido!`, 'Segunda fase', '#ff5a5a', 2);
        this.shake = Math.max(this.shake, 8);
        break;
      case 'nexusBolt': {
        const from = { x: this.nexusAt.x, y: this.nexusAt.y - 30 };
        this.bolts.push({ from, to: event.to, life: 0.18, maxLife: 0.18, seed: Math.random() * 100 });
        this.burst(event.to.x, event.to.y, 6, '#ffe9a8', 60, 0.3, 1.8, true);
        break;
      }
      case 'nexusShieldUp':
        this.ring(this.nexusAt.x, this.nexusAt.y - 8, 44, '#ffd25a', 0.6, 4);
        this.text(this.nexusAt.x, this.nexusAt.y - 56, 'Escudo!', '#ffd25a', 12);
        break;
      case 'nexusShieldBlocked':
        this.burst(this.nexusAt.x, this.nexusAt.y - 8, 8, '#ffe9a8', 70, 0.35, 2, true);
        break;
      case 'nexusUpgraded':
        this.ring(this.nexusAt.x, this.nexusAt.y + 6, 40, '#c8a8ff', 0.6, 3);
        this.burst(this.nexusAt.x, this.nexusAt.y - 12, 16, '#e2c8ff', 70, 0.7, 2.2, true, -50);
        break;
      case 'lootCollected':
        if (event.kind === 'coin') {
          this.text(event.x, event.y - 12, `+${event.value}`, GOLD, 10);
          this.burst(event.x, event.y, 6, GOLD, 50, 0.4, 1.8, true, -40);
        } else {
          this.ring(event.x, event.y, 22, GOLD, 0.5, 3);
          this.burst(event.x, event.y - 4, 18, '#ffe9a8', 80, 0.7, 2.2, true, -60);
          this.text(event.x, event.y - 20, 'Baú!', GOLD, 12);
        }
        break;
      case 'bountyGold':
        this.text(event.x + 8, event.y - 28, `+${event.gold}`, '#ffe9a8', 9);
        this.burst(event.x, event.y - 6, 6, GOLD, 60, 0.5, 2, true, -40);
        break;
      case 'nova': {
        const color = CREATURES[event.source].color;
        this.ring(event.x, event.y + 4, event.radius, color, 0.45, 3);
        this.burst(event.x, event.y, 10, color, 60, 0.4, 2, true);
        break;
      }
      case 'beam':
        this.beams.push({ ...event, color: CREATURES[event.source].color, life: 0.22, maxLife: 0.22 });
        break;
      case 'explosion':
        this.ring(event.x, event.y, event.radius, '#ff8a3a', 0.4, 4);
        this.burst(event.x, event.y, 18, '#ffb040', 110, 0.5, 2.6, true);
        this.shake = Math.max(this.shake, 3);
        break;
      case 'possessed':
        this.ring(event.x, event.y, 16, '#b88aff', 0.4, 2.5);
        this.burst(event.x, event.y - 6, 10, '#d8b8ff', 50, 0.6, 2, true, -30);
        break;
      case 'allyFaded':
        this.burst(event.x, event.y - 6, 8, '#e8f0c8', 40, 0.5, 2, false, -20);
        break;
      case 'executed':
        this.text(event.x, event.y - 24, 'Executado!', '#ff5a6a', 10);
        this.burst(event.x, event.y - 6, 10, '#ff3a4a', 80, 0.4, 2, true);
        break;
      case 'heroDied':
        this.burst(event.x, event.y - 8, 18, '#ff5a6a', 90, 0.6, 2.6, true);
        this.text(event.x, event.y - 30, 'Herói caiu!', '#ff7a84', 12);
        this.shake = Math.max(this.shake, 5);
        break;
      case 'heroRespawned':
        this.ring(event.x, event.y + 12, 30, '#ffd25a', 0.6, 3);
        this.burst(event.x, event.y, 14, '#ffe9a8', 60, 0.7, 2.2, true, -50);
        break;
      case 'heroLevelUp':
        this.banner(`Nível ${event.level}`, 'Herói', '#ffd25a', 1.2);
        break;
      case 'enemyDamaged':
        if (this.showDamageNumbers) {
          const amount = event.amount >= 10 ? Math.round(event.amount) : Math.round(event.amount * 10) / 10;
          this.texts.push({
            x: event.x + random(-6, 6),
            y: event.y - 14,
            text: event.crit ? `${amount}!` : String(amount),
            color: event.crit ? '#ffb02a' : '#f4ecff',
            size: event.crit ? 10 : 7,
            life: 0.5,
            maxLife: 0.5,
          });
        }
        break;
      case 'enemyKilled':
        this.corpses.push({ enemy: event.enemy, x: event.x, y: event.y, life: 0.45, maxLife: 0.45 });
        this.burst(event.x, event.y - 6, 8, event.color, 70, 0.45, 2.2, false);
        this.burst(event.x, event.y - 6, 4, GOLD, 50, 0.7, 2, true, -60, 160);
        this.particles.push({
          x: event.x,
          y: event.y - 10,
          vx: random(-6, 6),
          vy: -30,
          life: 0.9,
          maxLife: 0.9,
          size: 3.5,
          color: '#c8b0ff',
          gravity: 0,
          glow: true,
        });
        this.text(event.x, event.y - 18, `+${event.gold}`, GOLD, event.elite ? 13 : 10);
        if (event.elite) this.ring(event.x, event.y, 26, GOLD, 0.5, 3);
        break;
      case 'pulse': {
        const look = PULSE_LOOK[event.hero];
        if (event.cone) {
          // leque à frente do herói
          this.waves.push({ x: event.x, y: event.y, angle: event.cone.angle, halfAngle: event.cone.halfAngle, range: event.cone.length, life: 0.5, maxLife: 0.5 });
          this.shake = Math.max(this.shake, 3);
          break;
        }
        if (event.kind === 'glide' || event.kind === 'flame' || event.kind === 'meteors' || event.kind === 'judgment' || event.kind === 'swarm') {
          // esses têm visual próprio enquanto duram; aqui só um brilho no herói
          this.ring(event.x, event.y + 6, 22, look.ring, 0.35, 3);
          break;
        }
        if (event.kind === 'fissure' && event.to) {
          // fenda: poeira e pedras ao longo da linha
          for (let i = 0; i <= 16; i++) {
            const t = i / 16;
            this.burst(event.x + (event.to.x - event.x) * t, event.y + (event.to.y - event.y) * t + 6, 3, '#8a6a4a', 50, 0.6, 2.8, false, -40, 160);
          }
          this.ring(event.x, event.y + 8, 30, look.ring, 0.4, 4);
          this.shake = Math.max(this.shake, 7);
          break;
        }
        if (event.kind === 'hex') {
          // nuvem verde de feitiço
          this.ring(event.x, event.y, event.radius, '#7ad85a', 0.5, 5);
          this.burst(event.x, event.y - 6, 40, '#a8f080', event.radius * 1.6, 0.6, 2.6, true);
          this.burst(event.x, event.y - 6, 14, '#5a2a8a', event.radius, 0.7, 3, false, -20);
          break;
        }
        if (event.kind === 'transform') {
          // uivo de transformação: anel vermelho e lua
          this.ring(event.x, event.y, event.radius, '#ff5a3a', 0.6, 6);
          this.burst(event.x, event.y - 10, 30, '#ffb08a', 120, 0.7, 2.8, true, -40);
          this.banner('Fúria Lunar', 'Transformação', '#ff8a5a', 1.2);
          this.shake = Math.max(this.shake, 5);
          break;
        }
        if (event.to) {
          // investida em linha: rastro de partículas ao longo do caminho
          for (let i = 0; i <= 24; i++) {
            const t = i / 24;
            this.burst(event.x + (event.to.x - event.x) * t, event.y + (event.to.y - event.y) * t - 6, 2, look.particle, 30, 0.5, 3, true);
          }
          this.ring(event.to.x, event.to.y, 30, look.ring, 0.4, 4);
          this.shake = Math.max(this.shake, 3);
          break;
        }
        this.ring(event.x, event.y, event.radius, look.ring, 0.45, 6);
        this.ring(event.x, event.y, event.radius * 0.6, look.inner, 0.3, 3);
        for (let i = 0; i < 26; i++) {
          const a = (i / 26) * TAU;
          const speed = random(140, 220) * (event.radius / 95);
          this.particles.push({
            x: event.x,
            y: event.y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            life: 0.45,
            maxLife: 0.45,
            size: 2.4,
            color: Math.random() < 0.6 ? look.particle : look.inner,
            gravity: 0,
            glow: true,
          });
        }
        this.shake = Math.max(this.shake, 3);
        break;
      }
      case 'screech':
        this.waves.push({ ...event, life: 0.4, maxLife: 0.4 });
        break;
      case 'pulseEcho':
        this.text(event.x, event.y - 34, 'Eco!', '#c8a8ff', 12);
        this.ring(event.x, event.y, 26, '#c8a8ff', 0.4, 3);
        break;
      case 'pulseSwarm':
        // morcegos voam do herói até cada alvo
        for (const to of event.to) {
          this.shots.push({ source: 'batSwarm', from: event.from, to, duration: 0.35, remaining: 0.35, trailTimer: 0 });
        }
        this.burst(event.from.x, event.from.y - 8, 14, '#5a2a6a', 70, 0.5, 2.4, false, -30);
        break;
      case 'pulseFlame': {
        // jato de fogo: partículas em leque, renovadas a cada quadro
        for (let i = 0; i < 4; i++) {
          const a = event.angle + random(-event.halfAngle, event.halfAngle);
          const speed = random(event.length * 2.6, event.length * 3.6);
          this.particles.push({
            x: event.x + Math.cos(event.angle) * 8,
            y: event.y - 8 + Math.sin(event.angle) * 8,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            life: 0.32,
            maxLife: 0.32,
            size: random(2.4, 4),
            color: Math.random() < 0.5 ? '#ffb040' : Math.random() < 0.5 ? '#ff5a1a' : '#fff2c0',
            gravity: -40,
            glow: true,
          });
        }
        break;
      }
      case 'pulseStrike':
        if (event.kind === 'meteor') {
          this.ring(event.x, event.y, event.radius, '#ff6a1a', 0.45, 5);
          this.burst(event.x, event.y, 24, '#ffb040', 130, 0.55, 3, true);
          this.burst(event.x, event.y, 10, '#3a2a2a', 60, 0.8, 4, false, -50, 120);
          this.shake = Math.max(this.shake, 5);
        } else {
          // coluna de luz vinda do céu
          this.beams.push({ from: { x: event.x, y: event.y - 200 }, to: { x: event.x, y: event.y + 6 }, width: event.radius * 0.9, color: '#fff6c0', life: 0.45, maxLife: 0.45 });
          this.ring(event.x, event.y, event.radius, '#fff6c0', 0.5, 5);
          this.burst(event.x, event.y - 6, 30, '#ffe9a8', 120, 0.6, 2.8, true, -40);
          this.shake = Math.max(this.shake, 6);
        }
        break;
      case 'poolCreated':
        this.burst(event.x, event.y, 12, '#a8f080', 60, 0.5, 2.6, true, -20);
        break;
      case 'nexusHit':
        this.nexusHurt = 1;
        this.shake = Math.max(this.shake, Math.min(7, 2 + event.damage * 0.2));
        this.text(this.nexusAt.x, this.nexusAt.y - 52, `-${event.damage}`, '#ff5a6a', 13);
        this.burst(this.nexusAt.x, this.nexusAt.y - 16, 10, '#ff6a7a', 90, 0.5, 2.4, true);
        break;
      case 'wardBlocked':
        this.ring(this.nexusAt.x, this.nexusAt.y - 10, 40, '#ffd25a', 0.5, 4);
        this.text(this.nexusAt.x, this.nexusAt.y - 52, 'Égide!', '#ffd25a', 12);
        break;
      case 'nexusHealed':
        this.text(this.nexusAt.x + 14, this.nexusAt.y - 46, `+${event.amount}`, '#5af0a0', 11);
        this.burst(this.nexusAt.x, this.nexusAt.y - 16, 6, '#5af0a0', 40, 0.6, 2, true, -40);
        break;
      case 'bossSpawned':
        this.shake = Math.max(this.shake, 9);
        this.banner(`${ENEMIES[event.enemy].name} chegou!`, 'Chefe', '#ff5a5a', 2.6);
        break;
      case 'waveStarted':
        {
          // onda roteirizada: título e cor pelo tipo
          const colors: Record<string, string> = { normal: '#e2c8ff', horde: '#ffb84a', elite: '#ffd25a', event: '#7ad8ff', boss: '#ff5a5a', truce: '#7af0b0' };
          const sub = event.wave === event.total ? 'Onda final' : event.wave > event.total ? 'Sem Fim' : `de ${event.total}`;
          this.banner(event.title ? `${event.title}` : `Onda ${event.wave}`, event.title ? `Onda ${event.wave} · ${sub}` : sub, colors[event.kind] ?? '#e2c8ff', event.title ? 2.4 : 1.8);
        }
        break;
      case 'creaturePlaced': {
        const color = CREATURES[event.creature].color;
        this.ring(event.x, event.y + 12, 26, color, 0.5, 3);
        this.burst(event.x, event.y + 6, 14, color, 60, 0.7, 2.2, true, -50);
        break;
      }
      case 'creatureEvolved': {
        const def = CREATURES[event.creature];
        this.ring(event.x, event.y + 6, 34, def.color, 0.6, 4);
        this.ring(event.x, event.y + 6, 22, '#ffd25a', 0.45, 2.5);
        this.burst(event.x, event.y, 22, '#ffd25a', 90, 0.8, 2.4, true, -70);
        this.burst(event.x, event.y, 10, def.color, 60, 0.7, 2.6, true, -40);
        const label = event.ascended ? `${event.name}!` : `Nível ${event.level}`;
        this.text(event.x, event.y - 46, label, '#ffd25a', event.ascended ? 13 : 11);
        if (event.ascended) this.shake = Math.max(this.shake, 3);
        break;
      }
      case 'creatureSold':
        this.burst(event.x, event.y, 12, '#8a80a0', 50, 0.6, 3.5, false, -20);
        this.text(event.x, event.y - 20, `+${event.refund}`, GOLD, 11);
        break;
      default:
        break;
    }
  }

  update(dt: number): void {
    for (const shot of this.shots) {
      shot.remaining -= dt;
      shot.trailTimer -= dt;
      if (shot.trailTimer <= 0) {
        shot.trailTimer = 0.016;
        this.trail(shot);
      }
      if (shot.remaining <= 0) this.impact(shot);
    }
    this.shots = this.shots.filter((s) => s.remaining > 0);

    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - 2 * dt;
      p.vy *= 1 - (p.gravity ? 0.5 : 2) * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const r of this.rings) r.life -= dt;
    this.rings = this.rings.filter((r) => r.life > 0);
    for (const w of this.waves) w.life -= dt;
    this.waves = this.waves.filter((w) => w.life > 0);
    for (const b of this.beams) b.life -= dt;
    this.beams = this.beams.filter((b) => b.life > 0);
    for (const b of this.bolts) b.life -= dt;
    this.bolts = this.bolts.filter((b) => b.life > 0);
    for (const c of this.corpses) c.life -= dt;
    this.corpses = this.corpses.filter((c) => c.life > 0);
    for (const t of this.texts) {
      t.life -= dt;
      t.y -= 20 * dt;
    }
    this.texts = this.texts.filter((t) => t.life > 0);
    for (const b of this.banners) b.life -= dt;
    this.banners = this.banners.filter((b) => b.life > 0);
    this.shake = Math.max(0, this.shake - dt * 18);
    this.nexusHurt = Math.max(0, this.nexusHurt - dt * 3);
  }

  /** Deslocamento da câmera pelo tremor de tela. */
  shakeOffset(): Point {
    if (this.shake <= 0) return { x: 0, y: 0 };
    return { x: random(-1, 1) * this.shake, y: random(-1, 1) * this.shake };
  }

  /** Efeitos no mundo (projéteis, partículas, anéis, cadáveres, números). */
  drawWorld(ctx: CanvasRenderingContext2D, time: number): void {
    for (const bolt of this.bolts) drawBolt(ctx, bolt);
    for (const beam of this.beams) drawBeam(ctx, beam);
    for (const c of this.corpses) {
      const fade = c.life / c.maxLife;
      const def = ENEMIES[c.enemy];
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(c.x, c.y);
      ctx.rotate((1 - fade) * 0.5);
      const size = def.scale * (0.6 + fade * 0.4);
      drawLayered(ctx, 0, (1 - fade) * 4 - 6 * size, 40 * size, { filter: 'brightness(1.8) saturate(0.3)' }, (g) =>
        drawSprite(g, c.enemy, 0, (1 - fade) * 4, size, { time }),
      );
      ctx.restore();
    }

    for (const r of this.rings) {
      const progress = 1 - r.life / r.maxLife;
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = r.width * (1 - progress * 0.6);
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.radius * (0.2 + progress * 0.8), r.radius * (0.2 + progress * 0.8) * 0.8, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (const w of this.waves) {
      // ondas do grito da Banshee: arcos que se abrem no leque
      const progress = 1 - w.life / w.maxLife;
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = '#d8e4ff';
      for (let k = 0; k < 3; k++) {
        const r = w.range * Math.min(1, progress + k * 0.18);
        ctx.lineWidth = 2.5 - k * 0.6;
        ctx.beginPath();
        ctx.arc(w.x, w.y - 8, r, w.angle - w.halfAngle, w.angle + w.halfAngle);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    for (const shot of this.shots) drawShot(ctx, shot);

    for (const p of this.particles) {
      const fade = p.life / p.maxLife;
      ctx.globalCompositeOperation = p.glow ? 'lighter' : 'source-over';
      ctx.globalAlpha = Math.min(1, fade * 1.5);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.4 + fade * 0.6), 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const t of this.texts) {
      const fade = t.life / t.maxLife;
      const pop = 1 + Math.max(0, fade - 0.8) * 2;
      ctx.globalAlpha = Math.min(1, fade * 2.5);
      ctx.font = `700 ${t.size * pop}px Cinzel, Georgia, serif`;
      ctx.strokeStyle = '#0a0612';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  /** Faixas de anúncio no centro da tela ("Onda 3", chefe). */
  drawBanners(ctx: CanvasRenderingContext2D): void {
    const banner = this.banners[this.banners.length - 1];
    if (!banner) return;
    const age = banner.maxLife - banner.life;
    const alpha = Math.min(1, age / 0.25, banner.life / 0.5);
    const pop = 1 + Math.max(0, 0.25 - age) * 1.2;
    const x = ARENA.width / 2;
    const y = ARENA.height * 0.17;
    ctx.save();
    ctx.globalAlpha = alpha;
    const band = ctx.createLinearGradient(0, 0, ARENA.width, 0);
    band.addColorStop(0, '#0a061200');
    band.addColorStop(0.5, '#0a0612bb');
    band.addColorStop(1, '#0a061200');
    ctx.fillStyle = band;
    ctx.fillRect(0, y - 30, ARENA.width, 60);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 10px Cinzel, Georgia, serif`;
    ctx.fillStyle = '#a898c4';
    ctx.fillText(banner.subtitle.toUpperCase(), x, y - 17);
    ctx.font = `900 ${30 * pop}px 'Cinzel Decorative', Cinzel, Georgia, serif`;
    ctx.shadowColor = banner.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = banner.color;
    ctx.fillText(banner.text, x, y + 6);
    ctx.restore();
  }

  // ---------- auxiliares ----------

  private text(x: number, y: number, text: string, color: string, size: number): void {
    this.texts.push({ x, y, text, color, size, life: 0.9, maxLife: 0.9 });
  }

  private ring(x: number, y: number, radius: number, color: string, life: number, width: number): void {
    this.rings.push({ x, y, radius, color, life, maxLife: life, width });
  }

  private banner(text: string, subtitle: string, color: string, life: number): void {
    this.banners.push({ text, subtitle, color, life, maxLife: life });
  }

  private burst(
    x: number,
    y: number,
    count: number,
    color: string,
    speed: number,
    life: number,
    size: number,
    glow: boolean,
    lift = 0,
    gravity = 0,
  ): void {
    for (let i = 0; i < count; i++) {
      const a = random(0, TAU);
      const s = random(speed * 0.4, speed);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s + lift,
        life: random(life * 0.6, life),
        maxLife: life,
        size,
        color,
        gravity,
        glow,
      });
    }
  }

  private trail(shot: Shot): void {
    const pos = shotPosition(shot);
    if (shot.source === 'fireDragon') {
      this.burst(pos.x, pos.y, 2, Math.random() < 0.5 ? '#ffb040' : '#ff5a1a', 20, 0.35, 2.6, true, -10);
    } else if (shot.source === 'sanguine') {
      this.burst(pos.x, pos.y, 1, '#ff3050', 14, 0.35, 2, true);
    } else if (shot.source === 'haunt') {
      this.burst(pos.x, pos.y, 1, '#8ce8d8', 10, 0.45, 2.2, true, -10);
    } else if (shot.source === 'sorceress') {
      this.burst(pos.x, pos.y, 1, '#a8f080', 14, 0.35, 1.8, true);
    } else if (shot.source === 'iceDragon') {
      this.burst(pos.x, pos.y, 1, '#dff6ff', 12, 0.4, 1.8, true);
    }
  }

  private impact(shot: Shot): void {
    const { x, y } = shot.to;
    switch (shot.source) {
      case 'fireDragon': {
        const ability = CREATURES.fireDragon.ability;
        const radius = ability.kind === 'splash' ? ability.radius : 40;
        this.ring(x, y, radius, '#ff8a2a', 0.35, 4);
        this.burst(x, y, 16, '#ffb040', 110, 0.45, 3, true);
        this.burst(x, y, 6, '#4a3a3a', 40, 0.7, 4, false, -30);
        break;
      }
      case 'iceDragon':
        this.ring(x, y, 18, '#bff0ff', 0.3, 2.5);
        this.burst(x, y, 9, '#e8faff', 70, 0.5, 2, true);
        break;
      case 'archer':
        this.burst(x, y, 4, '#ffe9a8', 60, 0.25, 1.6, true);
        break;
      case 'duelist':
        this.burst(x, y, 6, '#ff3a50', 80, 0.3, 1.8, true);
        break;
      case 'sanguine':
        this.burst(x, y, 8, '#ff3050', 70, 0.4, 2, true);
        break;
      case 'guard':
        this.burst(x, y, 5, '#e8f0ff', 60, 0.25, 1.6, true);
        break;
      case 'hero':
      case 'hunter':
      case 'alpha':
        this.burst(x, y, 4, shot.color ?? '#e8f6ff', 70, 0.25, 1.6, true);
        break;
      case 'haunt':
        this.burst(x, y, 8, '#8ce8d8', 60, 0.45, 2.2, true);
        break;
      case 'sorceress':
        this.burst(x, y, 7, '#7ad85a', 60, 0.45, 2.2, true);
        break;
      case 'enemyArrow':
        this.burst(x, y, 4, '#ff8a6a', 50, 0.25, 1.6, true);
        break;
      case 'enemyBolt':
        this.burst(x, y, 10, '#7af0d8', 70, 0.4, 2.2, true);
        break;
      case 'web':
        this.burst(x, y, 6, '#ece4ff', 30, 0.4, 1.4, false);
        break;
      case 'cauldron':
      case 'banshee':
        break;
    }
  }
}

function shotPosition(shot: Shot): Point {
  const progress = 1 - shot.remaining / shot.duration;
  return {
    x: shot.from.x + (shot.to.x - shot.from.x) * progress,
    y: shot.from.y - 8 + (shot.to.y - shot.from.y + 8) * progress,
  };
}

/** Morcego pequeno em voo (asas batendo), legível sobre o chão escuro. */
function drawFlyingBat(ctx: CanvasRenderingContext2D, bx: number, by: number, phase: number): void {
  ctx.save();
  ctx.translate(bx, by);
  ctx.scale(1.6, 1.6);
  const x = 0;
  const y = 0;
  const flap = Math.sin(phase) * 3;
  ctx.fillStyle = '#6a2a7a';
  ctx.strokeStyle = '#ffb8d8';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - 4, y - 3 - flap, x - 7, y - 1 - flap);
  ctx.quadraticCurveTo(x - 4, y + 0.5, x - 1.5, y + 1.5);
  ctx.lineTo(x + 1.5, y + 1.5);
  ctx.quadraticCurveTo(x + 4, y + 0.5, x + 7, y - 1 - flap);
  ctx.quadraticCurveTo(x + 4, y - 3 - flap, x, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y + 0.5, 1.8, 2.2, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ff3a4a';
  ctx.fillRect(x - 1, y, 0.8, 0.8);
  ctx.fillRect(x + 0.3, y, 0.8, 0.8);
  ctx.restore();
}

function drawShot(ctx: CanvasRenderingContext2D, shot: Shot): void {
  const progress = 1 - shot.remaining / shot.duration;
  const { x, y } = shotPosition(shot);
  const angle = Math.atan2(shot.to.y - shot.from.y + 8, shot.to.x - shot.from.x);
  ctx.save();
  switch (shot.source) {
    case 'archer':
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = '#ffe9a855';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-8, 0);
      ctx.stroke();
      ctx.strokeStyle = '#8a5a32';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(4, 0);
      ctx.stroke();
      ctx.fillStyle = '#e0e8f4';
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(3, -2.2);
      ctx.lineTo(3, 2.2);
      ctx.fill();
      ctx.fillStyle = '#f4f0e8';
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(-12, -2.5);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-12, 2.5);
      ctx.fill();
      break;
    case 'fireDragon': {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 10);
      glow.addColorStop(0, '#fff2c0');
      glow.addColorStop(0.35, '#ffb040');
      glow.addColorStop(1, '#ff4a1a00');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, TAU);
      ctx.fill();
      break;
    }
    case 'iceDragon':
      ctx.translate(x, y);
      ctx.rotate(progress * 10);
      ctx.shadowColor = '#bff0ff';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#e8faff';
      ctx.strokeStyle = '#4aa8e8';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(2.5, 0);
      ctx.lineTo(0, 5);
      ctx.lineTo(-2.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'sanguine': {
      const orb = ctx.createRadialGradient(x, y, 0, x, y, 7);
      orb.addColorStop(0, '#ffd0d8');
      orb.addColorStop(0.4, '#ff3050');
      orb.addColorStop(1, '#a00c2400');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, TAU);
      ctx.fill();
      break;
    }
    case 'haunt':
    case 'sorceress': {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 7);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.35, shot.source === 'haunt' ? '#8ce8d8' : '#7ad85a');
      glow.addColorStop(1, '#00000000');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, TAU);
      ctx.fill();
      break;
    }
    case 'cauldron': {
      // poção arremessada em arco
      const lift = Math.sin(progress * Math.PI) * 30;
      ctx.translate(x, y - lift);
      ctx.rotate(progress * 8);
      ctx.fillStyle = '#5ad8a8';
      ctx.strokeStyle = '#170c24';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 1.5, 3.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c8b8a0';
      ctx.fillRect(-1.2, -4, 2.4, 3);
      break;
    }
    case 'banshee':
    case 'howler':
      break;
    case 'cleric':
    case 'possessor':
    case 'herbalist': {
      const color = shot.source === 'cleric' ? '#fff0b0' : shot.source === 'possessor' ? '#c8a8ff' : '#9aff8a';
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 6);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.4, color);
      glow.addColorStop(1, '#00000000');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, TAU);
      ctx.fill();
      break;
    }
    case 'batSwarm': {
      // revoada: cinco morcegos batendo asas até o alvo e uma mordida vermelha na chegada
      for (let i = 0; i < 5; i++) {
        const ox = Math.sin(progress * 12 + i * 1.3) * (11 - progress * 5);
        const oy = Math.cos(progress * 10 + i * 1.7) * (7 - progress * 3);
        drawFlyingBat(ctx, x + ox, y + oy - i * 0.6, progress * 40 + i * 1.9);
      }
      if (progress > 0.7) {
        const bite = (progress - 0.7) / 0.3;
        ctx.globalAlpha = 1 - bite;
        ctx.strokeStyle = '#ff3a5a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(shot.to.x, shot.to.y, 6 + bite * 12, 0, TAU);
        ctx.stroke();
        // marcas de presas
        ctx.fillStyle = '#ffd0da';
        for (let k = 0; k < 4; k++) {
          const t = (k * TAU) / 4 + 0.4;
          ctx.beginPath();
          ctx.arc(shot.to.x + Math.cos(t) * (5 + bite * 6), shot.to.y + Math.sin(t) * (5 + bite * 6), 1.3, 0, TAU);
          ctx.fill();
        }
      }
      break;
    }
    case 'storm': {
      // raio em zigue-zague da origem até o alvo
      ctx.strokeStyle = '#fff6a0';
      ctx.shadowColor = '#fff6a0';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 1 - progress;
      ctx.beginPath();
      ctx.moveTo(shot.from.x, shot.from.y - 6);
      for (let i = 1; i < 5; i++) {
        const t = i / 5;
        ctx.lineTo(shot.from.x + (shot.to.x - shot.from.x) * t + Math.sin(i * 7.1 + shot.duration) * 4, shot.from.y - 6 + (shot.to.y - shot.from.y + 6) * t + Math.cos(i * 5.3) * 4);
      }
      ctx.lineTo(shot.to.x, shot.to.y);
      ctx.stroke();
      break;
    }
    case 'enemyArrow':
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = '#e8dcc0';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(4, 0);
      ctx.stroke();
      ctx.fillStyle = '#ff6a3a';
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(2.5, -2);
      ctx.lineTo(2.5, 2);
      ctx.fill();
      break;
    case 'enemyBolt': {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 9);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.35, '#7af0d8');
      glow.addColorStop(1, '#3ac0b000');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, TAU);
      ctx.fill();
      break;
    }
    case 'curse':
      // praga: bola verde que espirala até a criatura
      ctx.fillStyle = '#9aff5a';
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(x + Math.sin(progress * 14) * 3, y + Math.cos(progress * 14) * 3, 3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#e8ffd0';
      ctx.beginPath();
      ctx.arc(x, y, 1.3, 0, TAU);
      ctx.fill();
      break;
    case 'snowball':
      // bola de neve do Yeti (sobe em arco)
      ctx.fillStyle = '#f4faff';
      ctx.strokeStyle = '#8ab0d0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y - Math.sin(progress * Math.PI) * 18, 4, 0, TAU);
      ctx.fill();
      ctx.stroke();
      break;
    case 'acid':
      // cuspe de ácido da Hidra
      ctx.fillStyle = '#b8ff4a';
      ctx.beginPath();
      ctx.ellipse(x, y, 3.6, 2.6, angle, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#6aba2a';
      for (let k = 1; k <= 3; k++) {
        ctx.beginPath();
        ctx.arc(x - Math.cos(angle) * k * 4, y - Math.sin(angle) * k * 4, 2 - k * 0.4, 0, TAU);
        ctx.fill();
      }
      break;
    case 'web':
      // fio de teia esticando até a criatura
      ctx.strokeStyle = '#ece4ffcc';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(shot.from.x, shot.from.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = '#ece4ff';
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, TAU);
      ctx.fill();
      break;
    case 'duelist':
    case 'guard':
    case 'hunter':
    case 'alpha':
    case 'hero': {
      // corte em meia-lua sobre o alvo
      const color = shot.color ?? (shot.source === 'duelist' ? '#ff3a50' : '#e8f6ff');
      const start = -1.6 + progress * 2.4;
      ctx.translate(shot.to.x, shot.to.y - 6);
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1 - progress * 0.6;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 12, start, start + 1.8);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 12, start + 0.3, start + 1.5);
      ctx.stroke();
      break;
    }
    default: {
      // criaturas sem projétil próprio: orbe brilhante na cor da criatura
      const color = shot.source in CREATURES ? CREATURES[shot.source as CreatureId].color : '#ffffff';
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 6);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.4, color);
      glow.addColorStop(1, '#00000000');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, TAU);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

function drawBolt(ctx: CanvasRenderingContext2D, bolt: Bolt): void {
  const steps = 6;
  ctx.save();
  ctx.globalAlpha = bolt.life / bolt.maxLife;
  ctx.globalCompositeOperation = 'lighter';
  for (const [width, color] of [
    [4, '#ffd25a66'],
    [1.6, '#fffbe8'],
  ] as const) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(bolt.from.x, bolt.from.y);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const jitter = Math.sin(bolt.seed + i * 7.3) * 6;
      ctx.lineTo(bolt.from.x + (bolt.to.x - bolt.from.x) * t + jitter, bolt.from.y + (bolt.to.y - bolt.from.y) * t + jitter * 0.6);
    }
    ctx.lineTo(bolt.to.x, bolt.to.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam): void {
  const alpha = beam.life / beam.maxLife;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const [width, color] of [
    [beam.width, beam.color + '55'],
    [Math.max(1.5, beam.width * 0.35), '#ffffff'],
  ] as const) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(beam.from.x, beam.from.y - 6);
    ctx.lineTo(beam.to.x, beam.to.y - 6);
    ctx.stroke();
  }
  ctx.restore();
}
