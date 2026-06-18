import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Phaser from 'phaser';
import { MainScene } from './scenes/main.scene';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true })
  gameContainer!: ElementRef<HTMLDivElement>;

  private game!: Phaser.Game;

  ngOnInit() {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this.gameContainer.nativeElement,
      backgroundColor: '#1a1a2e',
      scene: [MainScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });
  }

  ngOnDestroy() {
    this.game?.destroy(true);
  }
}
