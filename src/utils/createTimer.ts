class Timer {
  private element: HTMLElement;
  private initMinTime: number;

  constructor(initMinTime: number) {
    this.initMinTime = initMinTime * 60 * 1000;
    this.element = this.createTimer();
  }

  private createTimer(): HTMLElement {
    const timeBox = document.createElement('div');
    timeBox.className = 'timeBox-style';
    const timeDesc = document.createElement('span');
    timeDesc.className = 'timeDesc-style';
    timeDesc.textContent = '남은 시간';
    const timeText = document.createElement('span');
    timeText.className = 'timeText-style';

    let currentTime = this.initMinTime;

    const formatTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    timeText.textContent = formatTime(currentTime);

    const timeInterval = setInterval(() => {
      currentTime = currentTime - 1000;
      this.initMinTime = currentTime;

      timeText.textContent = formatTime(currentTime);

      if (currentTime === 0) {
        clearInterval(timeInterval);
        console.log('타임아웃이지롱 ');
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
