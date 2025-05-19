interface ItimeOptions {
  setMinTime: number;
  endPoint: string;
}

class Timer {
  private element: HTMLElement;
  private setMinTime: number;
  private endPoint: string;

  constructor(options: ItimeOptions) {
    this.setMinTime = options.setMinTime * 60 * 1000;
    this.element = this.createTimer();
    this.endPoint = options.endPoint;
  }

  private createTimer(): HTMLElement {
    const timeBox = document.createElement('div');
    timeBox.className = 'timeBox-style';
    const timeDesc = document.createElement('span');
    timeDesc.className = 'timeDesc-style';
    timeDesc.textContent = '남은 시간';
    const timeText = document.createElement('span');
    timeText.className = 'timeText-style';

    let currentTime = this.setMinTime;

    const formatTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    timeText.textContent = formatTime(currentTime);

    const timeInterval = setInterval(() => {
      currentTime = currentTime - 1000;
      this.setMinTime = currentTime;

      timeText.textContent = formatTime(currentTime);

      if (currentTime === 0) {
        clearInterval(timeInterval);
        window.location.href = this.endPoint;
      }
    }, 1000);

    timeBox.append(timeDesc);
    timeBox.append(timeText);
    return timeBox;
  }

  public appendTo(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }
}

export default Timer;
