/**
 * Entity System - Nhân vật Anime Chibi, Chiếc xe máy ShopeeFood, Thú cưng & NPCs
 */

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 16;
    this.speed = 3.2;
    this.sprintSpeed = 5.2;
    this.facing = 'down'; // 'up', 'down', 'left', 'right'
    this.isMoving = false;
    this.isSprinting = false;
    this.isRiding = false;
    this.vehicle = null;

    // Chỉ số người chơi
    this.money = 0;
    this.energy = 100; // Năng lượng / Tinh thần

    // Hoạt ảnh
    this.walkCycle = 0;
    this.sparkles = [];
    this.hearts = [];
  }

  update(keys, world) {
    if (this.isRiding && this.vehicle) {
      // Khi đang lái xe máy, vị trí gắn liền với xe
      this.vehicle.update(keys, world);
      this.x = this.vehicle.x;
      this.y = this.vehicle.y;
      this.facing = this.vehicle.facing;
      return;
    }

    // Di chuyển đi bộ
    let dx = 0;
    let dy = 0;

    if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

    this.isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
    const curSpeed = this.isSprinting ? this.sprintSpeed : this.speed;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    if (dx !== 0 || dy !== 0) {
      this.isMoving = true;
      this.walkCycle += 0.2;

      // Xác định hướng nhìn
      if (Math.abs(dx) > Math.abs(dy)) {
        this.facing = dx > 0 ? 'right' : 'left';
      } else {
        this.facing = dy > 0 ? 'down' : 'up';
      }

      // Thử di chuyển có kiểm tra va chạm
      const nextX = this.x + dx * curSpeed;
      const nextY = this.y + dy * curSpeed;

      if (!world.checkCollision(nextX, this.y, this.radius)) {
        this.x = nextX;
      }
      if (!world.checkCollision(this.x, nextY, this.radius)) {
        this.y = nextY;
      }

      // Bụi lấp lánh khi chạy nhanh
      if (this.isSprinting && Math.random() > 0.4) {
        this.sparkles.push({
          x: this.x + (Math.random() - 0.5) * 16,
          y: this.y + 16,
          size: 2 + Math.random() * 3,
          alpha: 1,
          color: '#fbbf24'
        });
      }
    } else {
      this.isMoving = false;
      this.walkCycle = 0;
    }

    // Cập nhật hiệu ứng hạt (sparkles & hearts)
    this.sparkles.forEach(s => {
      s.alpha -= 0.05;
      s.y -= 0.5;
    });
    this.sparkles = this.sparkles.filter(s => s.alpha > 0);

    this.hearts.forEach(h => {
      h.alpha -= 0.03;
      h.y -= 1.2;
      h.scale += 0.02;
    });
    this.hearts = this.hearts.filter(h => h.alpha > 0);
  }

  // Thả tim yêu đời
  triggerHeart() {
    this.hearts.push({
      x: this.x,
      y: this.y - 20,
      alpha: 1,
      scale: 1,
      char: '💖'
    });
  }

  // Lên / Xuống xe máy ShopeeFood
  mountVehicle(vehicle) {
    this.isRiding = true;
    this.vehicle = vehicle;
    vehicle.isOccupied = true;
  }

  dismountVehicle() {
    if (!this.isRiding || !this.vehicle) return;
    this.isRiding = false;
    this.vehicle.isOccupied = false;
    // Xuống xe ngay cạnh xe
    this.x = this.vehicle.x + 24;
    this.y = this.vehicle.y;
    this.vehicle = null;
  }

  render(ctx) {
    // Nếu đang lái xe thì xe sẽ vẽ người ngồi
    if (this.isRiding) return;

    // Vẽ hiệu ứng hạt lấp lánh
    for (const s of this.sparkles) {
      ctx.fillStyle = `rgba(251, 191, 36, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vẽ tim bay
    for (const h of this.hearts) {
      ctx.save();
      ctx.font = `${Math.floor(20 * h.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = h.alpha;
      ctx.fillText(h.char, h.x, h.y);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // Bóng dưới chân
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hoạt ảnh nhấp nhô khi đi bộ
    const bounce = this.isMoving ? Math.sin(this.walkCycle) * 3 : 0;

    // 1. Ba lô sinh viên sau lưng (nếu nhìn lên hoặc nghiêng)
    if (this.facing === 'up' || this.facing === 'left' || this.facing === 'right') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      const bOffset = this.facing === 'left' ? 4 : (this.facing === 'right' ? -4 : 0);
      ctx.roundRect(-8 + bOffset, -2 + bounce, 16, 18, 6);
      ctx.fill();
      // Quai ba lô xanh
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-6 + bOffset, 0 + bounce, 12, 14);
    }

    // 2. Chân & Giày Sneaker
    const legOffset = this.isMoving ? Math.sin(this.walkCycle) * 5 : 0;
    ctx.fillStyle = '#334155'; // Quần jean xanh đậm
    ctx.fillRect(-8, 10 + bounce - legOffset, 5, 8);
    ctx.fillRect(3, 10 + bounce + legOffset, 5, 8);
    // Giày sneaker trắng
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-9, 16 + bounce - legOffset, 7, 4);
    ctx.fillRect(2, 16 + bounce + legOffset, 7, 4);

    // 3. Áo Khoác ShopeeFood Màu Cam Đặc Trưng
    ctx.fillStyle = '#ee4d2d'; // Màu cam Shopee
    ctx.beginPath();
    ctx.roundRect(-10, -4 + bounce, 20, 16, 4);
    ctx.fill();
    // Vạch trắng phản quang áo shipper
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-10, 2 + bounce, 20, 3);

    // 4. Cổ áo & Khăn
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-4, -6 + bounce, 8, 3);

    // 5. Khuôn Mặt Chibi Anime (Cute)
    ctx.fillStyle = '#ffdfba'; // Da hồng hào
    ctx.beginPath();
    ctx.arc(0, -14 + bounce, 13, 0, Math.PI * 2);
    ctx.fill();

    // 6. Tóc Anime Bồng Bềnh Dễ Thương (Nâu hạt dẻ)
    ctx.fillStyle = '#4a2810';
    ctx.beginPath();
    // Mái tóc
    ctx.arc(0, -17 + bounce, 14, Math.PI, Math.PI * 2);
    ctx.fill();
    // Lọn tóc mái phủ trán
    ctx.beginPath();
    ctx.moveTo(-12, -18 + bounce);
    ctx.quadraticCurveTo(-4, -8 + bounce, 0, -14 + bounce);
    ctx.quadraticCurveTo(6, -8 + bounce, 12, -18 + bounce);
    ctx.fill();

    // 7. Mắt Anime to long lanh & Má Hồng
    if (this.facing !== 'up') {
      const eyeX = this.facing === 'left' ? -3 : (this.facing === 'right' ? 3 : 0);

      // Má hồng cute
      ctx.fillStyle = 'rgba(251, 113, 133, 0.7)';
      ctx.beginPath();
      ctx.arc(-7 + eyeX, -11 + bounce, 3, 0, Math.PI * 2);
      ctx.arc(7 + eyeX, -11 + bounce, 3, 0, Math.PI * 2);
      ctx.fill();

      // Mắt to đen láy
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(-4 + eyeX, -14 + bounce, 2.5, 0, Math.PI * 2);
      ctx.arc(4 + eyeX, -14 + bounce, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Đốm sáng phản chiếu trong mắt
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4.5 + eyeX, -15 + bounce, 1, 0, Math.PI * 2);
      ctx.arc(3.5 + eyeX, -15 + bounce, 1, 0, Math.PI * 2);
      ctx.fill();

      // Nụ cười mỉm
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(eyeX, -10 + bounce, 2, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }
}

/**
 * Xe máy ShopeeFood (Scooter phong cách GTA Cute)
 */
class Motorcycle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0; // radian
    this.speed = 0;
    this.maxSpeed = 7.5;
    this.accel = 0.22;
    this.friction = 0.94;
    this.steerSpeed = 0.055;
    this.facing = 'right';
    this.isOccupied = false;
    this.leanAngle = 0; // Độ nghiêng khi ôm cua
    this.tireTracks = [];
    this.exhaustPuffs = [];
  }

  update(keys, world) {
    if (!this.isOccupied) {
      this.speed *= 0.85;
      this.leanAngle *= 0.8;
      return;
    }

    // Tăng tốc / Lùi
    let isAccelerating = false;
    if (keys['KeyW'] || keys['ArrowUp']) {
      this.speed = Math.min(this.speed + this.accel, this.maxSpeed);
      isAccelerating = true;
    } else if (keys['KeyS'] || keys['ArrowDown']) {
      this.speed = Math.max(this.speed - this.accel, -this.maxSpeed * 0.4);
    } else {
      this.speed *= this.friction;
    }

    // Quẹo trái / phải & Tính độ nghiêng xe (Leaning)
    let steerDir = 0;
    if (Math.abs(this.speed) > 0.3) {
      const dir = this.speed > 0 ? 1 : -1;
      if (keys['KeyA'] || keys['ArrowLeft']) {
        this.angle -= this.steerSpeed * dir;
        steerDir = -1;
      }
      if (keys['KeyD'] || keys['ArrowRight']) {
        this.angle += this.steerSpeed * dir;
        steerDir = 1;
      }
    }

    // Độ nghiêng ôm cua mượt mà
    const targetLean = steerDir * (Math.abs(this.speed) / this.maxSpeed) * 0.28;
    this.leanAngle += (targetLean - this.leanAngle) * 0.15;

    // Di chuyển xe
    const nextX = this.x + Math.cos(this.angle) * this.speed;
    const nextY = this.y + Math.sin(this.angle) * this.speed;

    if (!world.checkCollision(nextX, this.y, 20)) {
      this.x = nextX;
    } else {
      this.speed *= -0.3; // Đâm nhẹ nảy lại
    }

    if (!world.checkCollision(this.x, nextY, 20)) {
      this.y = nextY;
    } else {
      this.speed *= -0.3;
    }

    // Khói ống xả khi tăng tốc
    if (isAccelerating && Math.random() > 0.4) {
      this.exhaustPuffs.push({
        x: this.x - Math.cos(this.angle) * 26 + (Math.random() - 0.5) * 4,
        y: this.y - Math.sin(this.angle) * 26 + (Math.random() - 0.5) * 4,
        r: 3 + Math.random() * 4,
        alpha: 0.6
      });
    }

    this.exhaustPuffs.forEach(p => {
      p.alpha -= 0.04;
      p.r += 0.3;
    });
    this.exhaustPuffs = this.exhaustPuffs.filter(p => p.alpha > 0);

    // Vết bánh xe mờ dần khi drift / chạy nhanh
    if (Math.abs(this.speed) > 4 && Math.random() > 0.5) {
      this.tireTracks.push({
        x: this.x - Math.cos(this.angle) * 15,
        y: this.y - Math.sin(this.angle) * 15,
        alpha: 0.4
      });
    }

    this.tireTracks.forEach(t => t.alpha -= 0.02);
    this.tireTracks = this.tireTracks.filter(t => t.alpha > 0);
  }

  render(ctx) {
    // Vẽ khói ống xả
    for (const p of this.exhaustPuffs) {
      ctx.fillStyle = `rgba(200, 210, 230, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vẽ vết bánh xe
    for (const t of this.tireTracks) {
      ctx.fillStyle = `rgba(0, 0, 0, ${t.alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + this.leanAngle * 0.4);

    // 1. Ánh đèn pha phía trước xe chiếu sáng trong đêm
    const headGlow = ctx.createRadialGradient(28, 0, 2, 85, 0, 85);
    headGlow.addColorStop(0, 'rgba(255, 255, 200, 0.5)');
    headGlow.addColorStop(0.5, 'rgba(255, 255, 200, 0.2)');
    headGlow.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = headGlow;
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.arc(25, 0, 130, -0.45, 0.45);
    ctx.closePath();
    ctx.fill();

    // 2. Bóng xe máy (có hiệu ứng nghiêng)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 4 + this.leanAngle * 8, 25, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Bánh xe trước & sau
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(16, -4, 9, 8); // Bánh trước
    ctx.fillRect(-23, -4, 9, 8); // Bánh sau
    // Mâm vành xe
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(19, -2, 3, 4);
    ctx.fillRect(-20, -2, 3, 4);

    // 4. Khung thân xe Vespa màu cam sữa pastel
    ctx.fillStyle = '#ff7a45';
    ctx.beginPath();
    ctx.roundRect(-16, -8, 34, 16, 6);
    ctx.fill();

    // Yếm xe trắng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(4, -7, 12, 14, 4);
    ctx.fill();

    // Sàn để chân
    ctx.fillStyle = '#334155';
    ctx.fillRect(2, -6, 5, 12);

    // Yên xe bọc da nâu
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.roundRect(-12, -6, 18, 12, 4);
    ctx.fill();

    // Tay lái (Handlebars)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(12, -11, 3, 22);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(11, -12, 4, 4);
    ctx.fillRect(11, 8, 4, 4);

    // Gương chiếu hậu 2 bên (Cute)
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(10, -13, 2.5, 0, Math.PI * 2);
    ctx.arc(10, 13, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Đèn pha trước
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(19, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Đèn hậu đỏ sau xe
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-26, -3, 2, 6);

    // 5. Thùng Hàng ShopeeFood To Đùng Phía Sau (Đặc Trưng Shipper)
    ctx.fillStyle = '#ee4d2d';
    ctx.beginPath();
    ctx.roundRect(-25, -9, 14, 18, 3);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-25, -9, 14, 18);
    // Logo ShopeeFood chữ 'S'
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S', -18, 4);

    // 6. Nếu có người đang ngồi lái: Vẽ nhân vật Anime lái xe siêu chi tiết!
    if (this.isOccupied) {
      // Hai chân đặt trên sàn xe
      ctx.fillStyle = '#334155';
      ctx.fillRect(1, -9, 4, 3);
      ctx.fillRect(1, 6, 4, 3);

      // Thân người mặc áo cam ShopeeFood
      ctx.fillStyle = '#ee4d2d';
      ctx.beginPath();
      ctx.roundRect(-6, -7, 13, 14, 5);
      ctx.fill();
      // Vạch trắng phản quang áo gió
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -1, 13, 2.5);

      // Hai tay duỗi ra nắm ghi-đông xe máy
      ctx.fillStyle = '#ee4d2d';
      ctx.fillRect(4, -8, 8, 3);
      ctx.fillRect(4, 5, 8, 3);
      // Găng tay lái xe
      ctx.fillStyle = '#ffdfba';
      ctx.fillRect(10, -9, 3, 4);
      ctx.fillRect(10, 5, 3, 4);

      // Ba lô nhỏ sau lưng
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-10, -5, 5, 10, 2);
      ctx.fill();

      // Nón bảo hiểm Anime phong cách Cute có tai mèo & kính chắn gió
      ctx.fillStyle = '#f59e0b'; // Nón vàng cam nổi bật
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      // Tai mèo nhỏ trên nón bảo hiểm (Cute Detail!)
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(-4, -8); ctx.lineTo(-1, -12); ctx.lineTo(2, -8);
      ctx.moveTo(-4, 8); ctx.lineTo(-1, 12); ctx.lineTo(2, 8);
      ctx.fill();

      // Kính chắn gió bảo hộ nón
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(3, 0, 6, -0.65, 0.65);
      ctx.fill();
      // Vệt sáng lóa trên kính
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(4, 0, 4, -0.3, 0.3);
      ctx.stroke();
    }

    ctx.restore();
  }
}

/**
 * NPCs: Thú cưng, Thầy cô, Khách nhận hàng
 */
class NPC {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type; // 'cat', 'dog', 'professor', 'customer'
    this.x = config.x;
    this.y = config.y;
    this.avatar = config.avatar || '🐱';
    this.dialogue = config.dialogue || [];
    this.animTimer = 0;
  }

  update() {
    this.animTimer += 0.05;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Bóng đổ
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.type === 'cat') {
      // Bé Mèo Chibi
      const tailWag = Math.sin(this.animTimer * 2) * 4;
      // Thân mèo cam
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      // Tai mèo
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-7, -6); ctx.lineTo(-3, -13); ctx.lineTo(0, -6);
      ctx.moveTo(0, -6); ctx.lineTo(4, -13); ctx.lineTo(8, -6);
      ctx.fill();

      // Mắt mèo híp lại cười
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-3, -1, 2, Math.PI, 0);
      ctx.arc(3, -1, 2, Math.PI, 0);
      ctx.stroke();

      // Đuôi ve vẩy
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-6, 4);
      ctx.quadraticCurveTo(-14, 0, -12 + tailWag, -8);
      ctx.stroke();

    } else if (this.type === 'professor') {
      // Thầy giáo hướng dẫn đồ án (Áo sơ mi trắng, kính cận, cặp táp)
      ctx.fillStyle = '#0f172a'; // Quần tây
      ctx.fillRect(-6, 6, 4, 8); ctx.fillRect(2, 6, 4, 8);
      ctx.fillStyle = '#f8fafc'; // Áo sơ mi
      ctx.beginPath();
      ctx.roundRect(-8, -6, 16, 14, 3);
      ctx.fill();
      // Đầu & Mắt kính
      ctx.fillStyle = '#ffdfba';
      ctx.beginPath();
      ctx.arc(0, -14, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-5, -16, 4, 3); ctx.strokeRect(1, -16, 4, 3);

    } else if (this.type === 'customer') {
      // Khách hàng vẫy tay nhận đồ ăn
      const wave = Math.sin(this.animTimer * 3) * 4;
      ctx.fillStyle = '#ec4899'; // Áo hồng
      ctx.beginPath();
      ctx.roundRect(-8, -4, 16, 14, 3);
      ctx.fill();
      // Đầu
      ctx.fillStyle = '#ffdfba';
      ctx.beginPath();
      ctx.arc(0, -13, 9, 0, Math.PI * 2);
      ctx.fill();
      // Tóc dài
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(0, -15, 10, Math.PI, Math.PI * 2);
      ctx.fill();
      // Tay vẫy vẫy
      ctx.strokeStyle = '#ffdfba';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, -2);
      ctx.lineTo(14, -10 + wave);
      ctx.stroke();
    }

    // Tên NPC trên đầu
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 10px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, 0, -22);

    ctx.restore();
  }
}

window.Player = Player;
window.Motorcycle = Motorcycle;
window.NPC = NPC;
