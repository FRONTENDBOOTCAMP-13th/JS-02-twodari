interface ItimeOptions {
  setMinTime: number;
  endPoint: string;
}

class Timer {
  private element: HTMLElement;
  private setMinTime: number;
  private endPoint: string;
  private timeText!: HTMLSpanElement;
  private timeInterval!: number;
  private currentTime: number;

  constructor(options: ItimeOptions) {
    this.setMinTime = options.setMinTime * 60 * 1000;
    this.currentTime = this.setMinTime;
    this.endPoint = options.endPoint;
    this.element = this.createTimer();
  }

  private formatTime(ms: number) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  private createTimer(): HTMLElement {
    const timeBox = document.createElement('div');
    timeBox.className = 'timeBox-style';
    const timeDesc = document.createElement('span');
    timeDesc.className = 'timeDesc-style';
    timeDesc.textContent = '남은 시간';
    this.timeText = document.createElement('span');
    this.timeText.className = 'timeText-style';

    this.timeText.textContent = this.formatTime(this.currentTime);

    this.timeInterval = window.setInterval(() => {
      this.currentTime = this.currentTime - 1000;
      this.setMinTime = this.currentTime;

      this.timeText.textContent = this.formatTime(this.currentTime);

      if (this.currentTime <= 0) {
        clearInterval(this.timeInterval);
        this.timeText.textContent = this.formatTime(0);
        window.location.href = this.endPoint;
      }
    }, 1000);

    // 클릭 시 00:00으로 리셋
    timeBox.addEventListener('click', () => this.resetToZero());

    timeBox.append(timeDesc);
    timeBox.append(this.timeText);

    return timeBox;
  }

  // 타이머를 00:00으로 만드는 메서드
  public resetToZero() {
    clearInterval(this.timeInterval);
    this.currentTime = 0;
    this.timeText.textContent = this.formatTime(0);
    window.location.href = this.endPoint;
  }

  public appendTo(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }
}

export default Timer;
