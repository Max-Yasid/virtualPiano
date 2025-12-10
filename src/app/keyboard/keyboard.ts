import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  Inject,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatSelectModule } from '@angular/material/select';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PaperBackground } from '../components/paper-background/paper-background';
import { keyNotes } from './utils/keyNotes';

import { promise } from './songs/silent hill - promise (reprise)';
import { The_scientist } from './songs/coldplay';

import AudioMotionAnalyzer from 'audiomotion-analyzer';

interface PianoKey {
  note: string;
  duration: string;
  noteDelayIndex: number;
}

@Component({
  selector: 'app-keyboard',
  imports: [
    PaperBackground,
    MatSelectModule,
    MatSlider,
    MatSliderThumb,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './keyboard.html',
  styleUrl: './keyboard.css',
})
export class Keyboard implements AfterViewInit {
  instruments = ['piano', '8_bit_computer'];
  selectedInstrument = signal(this.instruments[0]);
  instrumentSounds: Record<string, AudioBuffer> = {};

  keyNotes = keyNotes;
  defaultVolume = 5;

  audioContext?: AudioContext;
  gainNode?: GainNode;

  audioMotion: AudioMotionAnalyzer | null = null;

  @ViewChild('audioWaves') audioWaves!: ElementRef<HTMLDivElement>;
  @ViewChild('btnPlay') btnPlay!: ElementRef<HTMLButtonElement>;

  songs = [promise, The_scientist];
  selectedSong = new FormControl<(typeof promise)['song'] | null>(null);

  private unlockAudio = () => {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(console.error);
    }
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.audioContext = new window.AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.defaultVolume / 100;

      this.gainNode.connect(this.audioContext.destination);

      window.addEventListener('click', this.unlockAudio, { once: true });
      window.addEventListener('keydown', this.unlockAudio, { once: true });

      effect(() => {
        this.instrumentSounds = {};
        Object.values(this.keyNotes).forEach(async (note) => {
          try {
            let buffer: AudioBuffer | undefined;

            await this.loadAudioBuffer(note.soundNote)
              .then((res): any => {
                if (res) return res;
              })
              .then((decoded) => (buffer = decoded || undefined));

            if (this.audioContext && buffer) {
              this.instrumentSounds[note.soundNote] = buffer;
            }
          } catch {
            return;
          }
        });
      });

      window.addEventListener('keydown', (e) => {
        const key = (this.keyNotes as any)[e.key.toLowerCase()];
        if (!key) return;
        this.playNote(key.soundNote);
        const keyElement = document.querySelector(`#${key.soundNote}`) as HTMLElement;
        keyElement?.classList.add('active');
      });

      window.addEventListener('keyup', (e) => {
        const key = (this.keyNotes as any)[e.key.toLowerCase()];
        if (!key) return;
        const mouseUpEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          button: 0,
          clientX: 100,
          clientY: 50,
        });
        const keyElement = document.querySelector(`#${key.soundNote}`) as HTMLElement;
        keyElement?.dispatchEvent(mouseUpEvent);
        keyElement?.classList.remove('active');
      });
    }
  }

  ngAfterViewInit() {
    if (isPlatformServer(this.platformId)) return;
  }
  private initAudioMotion() {
    if (this.audioMotion) return;
    if (!this.audioContext || !this.gainNode || !this.audioWaves) return;

    this.audioMotion = new AudioMotionAnalyzer(this.audioWaves.nativeElement, {
      audioCtx: this.audioContext,
      mode: 2,
      showBgColor: false,
      overlay: true,
      gradient: 'prism',
      showScaleX: false,
      showScaleY: false,
      showPeaks: true,
      reflexRatio: 0.4,
    });

    this.audioMotion.connectInput(this.gainNode);
  }
  async playSong() {
    if (isPlatformServer(this.platformId)) return;
    if (!this.selectedSong.value || !this.audioContext) return;

    // make sure context is running when you hit play
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const bpm = this.selectedSong.value.bpm;
    const totalLoopsToPlay = 1;
    const timePerLoop =
      (this.selectedSong.value.piano.at(-1) as PianoKey).noteDelayIndex * bpm * 1000 + bpm * 1000;

    for (let currentLoop = 1; currentLoop <= totalLoopsToPlay; currentLoop++) {
      this.selectedSong.value.piano.forEach((key) => {
        setTimeout(() => {
          if (!key) return;

          const mousedownEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            button: 0,
            clientX: 100,
            clientY: 50,
          });

          const keyElement = document.querySelector(`#${key.note}`) as HTMLElement;
          keyElement?.dispatchEvent(mousedownEvent);
          keyElement?.classList.add('active');

          setTimeout(() => {
            const mouseUpEvent = new MouseEvent('mouseup', {
              bubbles: true,
              cancelable: true,
              button: 0,
              clientX: 100,
              clientY: 50,
            });
            const keyEl2 = document.querySelector(`#${key.note}`) as HTMLElement;
            keyEl2?.dispatchEvent(mouseUpEvent);
            keyEl2?.classList.remove('active');
          }, 400);
        }, key.noteDelayIndex * bpm * 1000 + timePerLoop * (currentLoop - 1) + (currentLoop > 1 ? bpm * (currentLoop - 1) * 1000 : 0));
      });
    }
  }

  playNote(note: string) {
    if (!this.audioContext || !this.gainNode) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const buffer = this.instrumentSounds[note];
    if (!buffer) return;
    this.initAudioMotion();
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);
    const now = this.audioContext.currentTime;
    source.start(now);
    if (this.selectedInstrument() === '8_bit_computer') source.stop(now + 0.3);
  }

  async loadAudioBuffer(
    note: string,
    instrument = this.selectedInstrument(),
    exts = ['mp3', 'ogg', 'wav']
  ): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    for (const ext of exts) {
      const url = `assets/samples/${instrument}/${note}.${ext}`; // <- no leading slash
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`[Audio] Sample not found: ${url} (status: ${response.status})`);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        try {
          const decoded = await this.audioContext.decodeAudioData(arrayBuffer);
          return decoded;
        } catch (err) {
          console.error(`[Audio] Failed to decode sample: ${url}`, err);
        }
      } catch (err) {
        console.error(`[Audio] Error fetching sample: ${url}`, err);
      }
    }

    console.error(`[Audio] No valid sample found for note "${note}" (instrument: "${instrument}")`);
    return null;
  }

  changeVolume(newVolume: Event) {
    if (this.gainNode)
      this.gainNode.gain.value = Number((newVolume.target as HTMLInputElement).value) / 100;
  }

  get keyNotesAsArray() {
    return Object.entries(this.keyNotes)
      .map(([hotkey, note]) => ({ ...note, keyboardKey: hotkey }))
      .sort((a, b) => a.position - b.position);
  }
}
