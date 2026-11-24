import confetti from 'canvas-confetti';
import { sound } from './audio.js';

export class MiniGameManager {
  constructor(app) {
    this.app = app;
    this.siemSiFortunes = [
      {
        num: '๑',
        title: 'ใบที่ ๑ : มหามงคลเอกอุ',
        desc: 'เปรียบดั่งดวงอาทิตย์ยามรุ่งอรุณ การงานก้าวหน้า ผู้ใหญ่เกื้อหนุน การเงินคล่องตัว สิ่งที่มุ่งหวังจะสำเร็จทุกประการ โชคลาภโดดเด่นมาก'
      },
      {
        num: '๗',
        title: 'ใบที่ ๗ : วาสนาผูกพัน',
        desc: 'ดวงความรักสดใส คนโสดมีเกณฑ์พบเนื้อคู่ที่จริงใจ คนมีคู่ความสัมพันธ์อบอุ่นแน่นแฟ้น การเจรจาค้าขายราบรื่น ได้กำไรงดงาม'
      },
      {
        num: '๙',
        title: 'ใบที่ ๙ : ร่มโพธิ์ร่มไทร',
        desc: 'แคล้วคลาดปลอดภัยจากภยันตรายทั้งปวง สุขภาพกายใจแข็งแรง สิ่งที่เคยติดขัดจะคลี่คลาย จะได้รับข่าวดีจากทางไกล มีโชคจากผู้ใหญ่'
      },
      {
        num: '๑๕',
        title: 'ใบที่ ๑๕ : ลาภลอยพูนทวี',
        desc: 'มีเกณฑ์ได้รับโชคลาภไม่คาดฝัน การเงินสะพัด การลงทุนมีผลกำไรคุ้มค่า คิดสิ่งใดให้รีบลงมือทำ ความพยายามจะไม่สูญเปล่า'
      },
      {
        num: '๒๑',
        title: 'ใบที่ ๒๑ : ฟ้าหลังฝนงดงาม',
        desc: 'เคราะห์ร้ายเบาบาง ความทุกข์ใจจะมลายหายไป มีโอกาสใหม่ๆ เข้ามาในชีวิต ให้หมั่นทำบุญปล่อยปลา ไหว้พระ ชีวิตจะเจริญรุ่งเรือง'
      },
      {
        num: '๒๘',
        title: 'ใบที่ ๒๘ : ปัญญาสว่างไสว',
        desc: 'การเรียน การสอบ การสอบแข่งขันจะผ่านฉลุย ปัญญาเฉียบแหลม ความคิดสร้างสรรค์พรั่งพรู เป็นที่รักของเพื่อนร่วมงานและบริวาร'
      }
    ];

    // Balloon game state
    this.dartsLeft = 3;
    this.balloonScore = 0;
    this.balloons = [];
  }

  // 1. Balloon Darts Mini-game
  startBalloonGame() {
    this.dartsLeft = 3;
    this.balloonScore = 0;
    const modal = document.getElementById('balloon-modal');
    modal.classList.remove('hidden');

    const board = document.getElementById('balloon-board');
    board.innerHTML = '';
    this.balloons = [];

    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

    // Generate 24 balloons on board
    for (let i = 0; i < 24; i++) {
      const b = document.createElement('div');
      b.className = 'balloon-target';
      const col = colors[i % colors.length];
      b.style.backgroundColor = col;
      b.style.boxShadow = `0 6px 16px ${col}88`;

      b.addEventListener('click', (e) => {
        if (this.dartsLeft <= 0 || b.classList.contains('popped')) return;
        this.popBalloon(b, e);
      });

      board.appendChild(b);
      this.balloons.push(b);
    }

    this.updateBalloonUI();
  }

  popBalloon(elem, evt) {
    elem.classList.add('popped');
    this.dartsLeft--;
    this.balloonScore++;
    sound.playPop();

    // Visual burst effect
    const rect = elem.getBoundingClientRect();
    confetti({
      particleCount: 18,
      spread: 60,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      }
    });

    this.updateBalloonUI();

    if (this.dartsLeft <= 0) {
      setTimeout(() => {
        this.endBalloonGame();
      }, 700);
    }
  }

  updateBalloonUI() {
    document.getElementById('darts-count').textContent = this.dartsLeft;
    document.getElementById('balloon-score').textContent = this.balloonScore;
  }

  endBalloonGame() {
    let msg = `คุณปาแตก ${this.balloonScore} ลูก! `;
    let coinsEarned = this.balloonScore * 20;
    if (this.balloonScore >= 3) {
      msg += 'สุดยอดมาก! รับรางวัลตุ๊กตาหมีงานวัด 🧸 และเหรียญทำบุญ +60 เหรียญ!';
      confetti({ particleCount: 80, spread: 80 });
      this.app.addFestivalBadge('🧸 ตุ๊กตาหมีปาโป่ง');
    } else {
      msg += `รับเหรียญรางวัล +${coinsEarned} เหรียญ!`;
    }
    this.app.addCoins(coinsEarned);
    this.app.showToast(msg, '🎉');

    setTimeout(() => {
      document.getElementById('balloon-modal').classList.add('hidden');
    }, 1500);
  }

  // 2. Siem-Si Fortune Teller
  startSiemSi() {
    const modal = document.getElementById('siemsi-modal');
    modal.classList.remove('hidden');

    const resultBox = document.getElementById('siemsi-result');
    resultBox.classList.add('hidden');

    const shaker = document.getElementById('siemsi-shaker');
    shaker.classList.remove('shaking');
  }

  shakeSiemSi() {
    const shaker = document.getElementById('siemsi-shaker');
    shaker.classList.add('shaking');
    sound.playClack();

    // After animation, display fortune
    setTimeout(() => {
      shaker.classList.remove('shaking');
      sound.playWishChime();

      const fortune = this.siemSiFortunes[Math.floor(Math.random() * this.siemSiFortunes.length)];
      const resultBox = document.getElementById('siemsi-result');
      document.getElementById('siemsi-title').textContent = fortune.title;
      document.getElementById('siemsi-desc').textContent = fortune.desc;
      resultBox.classList.remove('hidden');

      confetti({ particleCount: 30, spread: 50 });
      this.app.showToast(`ได้เซียมซี ${fortune.title}`, '📜');
    }, 1200);
  }

  // 3. Buy Food
  buyFood(stallData) {
    if (this.app.coins < stallData.item.price) {
      this.app.showToast('เหรียญของคุณไม่พอ! ไปเล่นเกมปาโป่งเพื่อรับเหรียญเพิ่มได้นะ', '⚠️');
      return;
    }

    this.app.deductCoins(stallData.item.price);
    sound.playCoin();
    sound.playEat();

    // Apply food buff
    this.app.player.applySpeedBuff(14);
    this.app.showToast(`ซื้อ ${stallData.item.name} สำเร็จ! ${stallData.item.buff}`, stallData.item.icon);
    this.app.addFestivalBadge(stallData.item.name);
  }
}
