/**
 * Entity System - Nhân vật Anime Chibi, Chiếc xe máy ShopeeFood, Thú cưng, Xe cộ & Buồng lái POV
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
    this.x = this.vehicle.x + 24;
    this.y = this.vehicle.y;
    this.vehicle = null;
  }

  render(ctx, isRaining = false) {
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

    const bounce = this.isMoving ? Math.sin(this.walkCycle) * 3 : 0;

    // 1. Ba lô sinh viên sau lưng
    if (this.facing === 'up' || this.facing === 'left' || this.facing === 'right') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      const bOffset = this.facing === 'left' ? 4 : (this.facing === 'right' ? -4 : 0);
      ctx.roundRect(-8 + bOffset, -2 + bounce, 16, 18, 6);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-6 + bOffset, 0 + bounce, 12, 14);
    }

    // 2. Chân & Giày Sneaker
    const legOffset = this.isMoving ? Math.sin(this.walkCycle) * 5 : 0;
    ctx.fillStyle = '#334155';
    ctx.fillRect(-8, 10 + bounce - legOffset, 5, 8);
    ctx.fillRect(3, 10 + bounce + legOffset, 5, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-9, 16 + bounce - legOffset, 7, 4);
    ctx.fillRect(2, 16 + bounce + legOffset, 7, 4);

    // 3. Áo Khoác ShopeeFood (hoặc Áo mưa tiện lợi khi trời mưa)
    if (isRaining) {
      ctx.fillStyle = 'rgba(238, 77, 45, 0.9)';
      ctx.beginPath();
      ctx.roundRect(-12, -5 + bounce, 24, 20, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(-12, 3 + bounce, 24, 3);
    } else {
      ctx.fillStyle = '#ee4d2d';
      ctx.beginPath();
      ctx.roundRect(-10, -4 + bounce, 20, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-10, 2 + bounce, 20, 3);
    }

    // 4. Cổ áo
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-4, -6 + bounce, 8, 3);

    // 5. Khuôn Mặt Chibi Anime
    ctx.fillStyle = '#ffdfba';
    ctx.beginPath();
    ctx.arc(0, -14 + bounce, 13, 0, Math.PI * 2);
    ctx.fill();

    // 6. Tóc Anime
    ctx.fillStyle = '#4a2810';
    ctx.beginPath();
    ctx.arc(0, -17 + bounce, 14, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-12, -18 + bounce);
    ctx.quadraticCurveTo(-4, -8 + bounce, 0, -14 + bounce);
    ctx.quadraticCurveTo(6, -8 + bounce, 12, -18 + bounce);
    ctx.fill();

    // 7. Mắt Anime to long lanh & Má Hồng
    if (this.facing !== 'up') {
      const eyeX = this.facing === 'left' ? -3 : (this.facing === 'right' ? 3 : 0);

      // Má hồng
      ctx.fillStyle = 'rgba(251, 113, 133, 0.7)';
      ctx.beginPath();
      ctx.arc(-7 + eyeX, -11 + bounce, 3, 0, Math.PI * 2);
      ctx.arc(7 + eyeX, -11 + bounce, 3, 0, Math.PI * 2);
      ctx.fill();

      // Mắt
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(-4 + eyeX, -14 + bounce, 2.5, 0, Math.PI * 2);
      ctx.arc(4 + eyeX, -14 + bounce, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Đốm sáng phản chiếu
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4.5 + eyeX, -15 + bounce, 1, 0, Math.PI * 2);
      ctx.arc(3.5 + eyeX, -15 + bounce, 1, 0, Math.PI * 2);
      ctx.fill();

      // Nụ cười
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
    this.maxSpeed = 7.8;
    this.accel = 0.24;
    this.friction = 0.94;
    this.steerSpeed = 0.055;
    this.facing = 'right';
    this.isOccupied = false;
    this.leanAngle = 0; // Độ nghiêng khi ôm cua
    this.tireTracks = [];
    this.exhaustPuffs = [];

    // Bảng màu sơn xe máy
    this.colors = ['#ff7a45', '#f472b6', '#38bdf8', '#a855f7', '#10b981', '#334155'];
    this.colorNames = ['Cam Shopee 🛵', 'Hồng Sakura 🌸', 'Xanh Mint 🌿', 'Tím Cyberpunk 🔮', 'Xanh Ngọc Bích ✨', 'Đen Nhám Cực Ngầu 🕶️'];
    this.colorIndex = 0;

    // Hiệu ứng chú vịt vàng gắn ghi-đông
    this.duckQuackAnim = 0;
  }

  cycleColor() {
    this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    return this.colorNames[this.colorIndex];
  }

  triggerDuck() {
    this.duckQuackAnim = 1.0;
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
      this.speed *= -0.3;
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

    // Vết bánh xe
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

  // Góc nhìn thứ ba (Top-down GTA)
  render(ctx, isRaining = false) {
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

    // 1. Ánh đèn pha phía trước xe
    const headGlow = ctx.createRadialGradient(28, 0, 2, 85, 0, 85);
    headGlow.addColorStop(0, 'rgba(255, 255, 200, 0.55)');
    headGlow.addColorStop(0.5, 'rgba(255, 255, 200, 0.2)');
    headGlow.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = headGlow;
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.arc(25, 0, 140, -0.45, 0.45);
    ctx.closePath();
    ctx.fill();

    // 2. Bóng xe máy
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 4 + this.leanAngle * 8, 25, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Bánh xe trước & sau
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(16, -4, 9, 8);
    ctx.fillRect(-23, -4, 9, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(19, -2, 3, 4);
    ctx.fillRect(-20, -2, 3, 4);

    // 4. Khung thân xe Vespa theo màu đã chọn
    ctx.fillStyle = this.colors[this.colorIndex];
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

    // Gương chiếu hậu
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(10, -13, 2.5, 0, Math.PI * 2);
    ctx.arc(10, 13, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Đèn pha trước & Đèn hậu
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(19, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-26, -3, 2, 6);

    // 5. Thùng Hàng ShopeeFood Phía Sau
    ctx.fillStyle = '#ee4d2d';
    ctx.beginPath();
    ctx.roundRect(-25, -9, 14, 18, 3);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-25, -9, 14, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S', -18, 4);

    // 6. Người đang ngồi lái
    if (this.isOccupied) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(1, -9, 4, 3);
      ctx.fillRect(1, 6, 4, 3);

      ctx.fillStyle = isRaining ? 'rgba(238, 77, 45, 0.9)' : '#ee4d2d';
      ctx.beginPath();
      ctx.roundRect(-6, -7, 13, 14, 5);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -1, 13, 2.5);

      ctx.fillStyle = '#ee4d2d';
      ctx.fillRect(4, -8, 8, 3);
      ctx.fillRect(4, 5, 8, 3);
      ctx.fillStyle = '#ffdfba';
      ctx.fillRect(10, -9, 3, 4);
      ctx.fillRect(10, 5, 3, 4);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-10, -5, 5, 10, 2);
      ctx.fill();

      // Nón bảo hiểm tai mèo
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(-4, -8); ctx.lineTo(-1, -12); ctx.lineTo(2, -8);
      ctx.moveTo(-4, 8); ctx.lineTo(-1, 12); ctx.lineTo(2, 8);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(3, 0, 6, -0.65, 0.65);
      ctx.fill();
    }

    ctx.restore();
  }

  // Góc nhìn buồng lái thứ nhất (First-Person POV Cockpit View)
  renderCockpit(ctx, w, h, quest) {
    if (!this.isOccupied) return;

    ctx.save();
    const cx = w / 2;
    const cy = h - 90;
    const steer = this.leanAngle * 1.5;
    const speedKmH = Math.round(Math.abs(this.speed) * 7.5);
    const vibration = Math.sin(Date.now() * 0.02) * (this.speed !== 0 ? 1.5 : 0.4);

    // 1. Kính chắn gió cong phía trước (Windshield)
    ctx.fillStyle = 'rgba(186, 230, 253, 0.12)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 260, h);
    ctx.quadraticCurveTo(cx, h - 340, cx + 260, h);
    ctx.fill();
    ctx.stroke();

    // 2. Gương chiếu hậu 2 bên (Side Mirrors)
    const drawMirror = (mx, my, isLeft) => {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(isLeft ? cx - 180 : cx + 180, cy - 30);
      ctx.lineTo(mx, my);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(mx, my, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.beginPath();
      ctx.arc(mx - 8, my + 5, 6, 0, Math.PI * 2);
      ctx.arc(mx + 12, my - 6, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    drawMirror(cx - 320, cy - 130 + vibration, true);
    drawMirror(cx + 320, cy - 130 + vibration, false);

    // 3. Toàn bộ cụm Ghi-đông xe (xoay theo tay lái)
    ctx.save();
    ctx.translate(cx, cy + vibration);
    ctx.rotate(steer);

    // Khung kim loại ghi-đông
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(-260, 20);
    ctx.lineTo(-120, -10);
    ctx.lineTo(120, -10);
    ctx.lineTo(260, 20);
    ctx.stroke();

    // Ốp ghi-đông theo màu xe
    ctx.fillStyle = this.colors[this.colorIndex];
    ctx.beginPath();
    ctx.roundRect(-100, -25, 200, 50, 16);
    ctx.fill();

    // Tay nắm cao su 2 bên (Grips)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-270, 5, 80, 26, 8);
    ctx.roundRect(190, 5, 80, 26, 8);
    ctx.fill();

    // Cần gạt phanh nhôm
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-260, -8, 70, 7);
    ctx.fillRect(190, -8, 70, 7);

    // 4. Bảng đồng hồ Taplo Kỹ Thuật Số (Digital Dashboard Cluster)
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(-75, -75, 150, 68, 12);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Chữ số điện tử tốc độ KM/H
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${speedKmH}`, 0, -42);
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('KM / H', 0, -28);

    // Vạch năng lượng / xăng
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-45, -18, 90, 5);

    // Đèn xi nhan nhấp nháy khi ôm cua
    const blink = Math.floor(Date.now() / 250) % 2 === 0;
    if (this.leanAngle < -0.05 && blink) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('◀', -58, -48);
    }
    if (this.leanAngle > 0.05 && blink) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('▶', 58, -48);
    }

    // 5. Giá Kẹp Điện Thoại & Màn Hình App ShopeeFood
    ctx.save();
    ctx.translate(130, -35);
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(-35, -55, 70, 105, 8);
    ctx.fill();
    ctx.strokeStyle = '#ee4d2d';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ee4d2d';
    ctx.fillRect(-31, -48, 62, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHOPEE DRIVER', 0, -36);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-31, -28, 62, 70);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px sans-serif';
    ctx.fillText('🧭', 0, -8);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 7px Nunito, sans-serif';
    ctx.fillText(quest ? 'CÓ ĐƠN HÀNG' : 'CHỜ ĐƠN...', 0, 12);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '6px Nunito, sans-serif';
    ctx.fillText('Đang kết nối GPS', 0, 26);
    ctx.restore();

    // 6. Chú Vịt Vàng Đội Nón Bảo Hiểm
    ctx.save();
    const duckSquash = this.duckQuackAnim > 0 ? 0.75 : 1.0;
    if (this.duckQuackAnim > 0) this.duckQuackAnim -= 0.08;
    ctx.translate(-130, -32);
    ctx.scale(1, duckSquash);

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(8, 2, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-3, -7, 18, 7, 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -6, 15, Math.PI, Math.PI * 2);
    ctx.fill();

    const propRot = (Date.now() * 0.04 * (1 + Math.abs(this.speed)));
    ctx.save();
    ctx.translate(0, -21);
    ctx.rotate(propRot);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-12, -2, 24, 4);
    ctx.restore();

    ctx.restore();

    // 7. Hai Bàn Tay Anime Đeo Găng Lái Xe
    ctx.fillStyle = '#ee4d2d';
    ctx.beginPath();
    ctx.roundRect(-245, -5, 34, 38, 10);
    ctx.fill();
    ctx.fillStyle = '#ffdfba';
    ctx.fillRect(-235, 18, 18, 14);

    ctx.fillStyle = '#ee4d2d';
    ctx.beginPath();
    ctx.roundRect(210, -5, 34, 38, 10);
    ctx.fill();
    ctx.fillStyle = '#ffdfba';
    ctx.fillRect(217, 18, 18, 14);

    ctx.restore();
    ctx.restore();
  }
}

/**
 * Xe cộ lưu thông trên đường (Traffic Vehicles)
 */
class TrafficVehicle {
  constructor(config) {
    this.id = config.id;
    this.type = config.type; // 'bus', 'scooter'
    this.x = config.x;
    this.y = config.y;
    this.speed = config.speed || 2.5;
    this.dir = config.dir || 1;
    this.startX = config.startX || 0;
    this.endX = config.endX || 3000;
  }

  update() {
    this.x += this.speed * this.dir;
    if (this.dir > 0 && this.x > this.endX) {
      this.x = this.startX;
    } else if (this.dir < 0 && this.x < this.startX) {
      this.x = this.endX;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.type === 'bus') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(-65, -18, 130, 46);

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(-60, -22, 120, 44, 8);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-60, -10, 120, 20);

      ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(-50 + i * 22, -18, 16, 12);
      }

      ctx.fillStyle = '#fef08a';
      if (this.dir > 0) ctx.fillRect(58, -14, 4, 10);
      else ctx.fillRect(-62, -14, 4, 10);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BUS 08 🚌', 0, 4);

    } else if (this.type === 'scooter') {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.roundRect(-12, -6, 24, 12, 4);
      ctx.fill();

      ctx.fillStyle = '#ee4d2d';
      ctx.fillRect(-18, -7, 10, 14);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ĐỒNG NGHIỆP 🛵', 0, -14);
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

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.type === 'cat') {
      const tailWag = Math.sin(this.animTimer * 2) * 4;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-7, -6); ctx.lineTo(-3, -13); ctx.lineTo(0, -6);
      ctx.moveTo(0, -6); ctx.lineTo(4, -13); ctx.lineTo(8, -6);
      ctx.fill();

      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-3, -1, 2, Math.PI, 0);
      ctx.arc(3, -1, 2, Math.PI, 0);
      ctx.stroke();

      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-6, 4);
      ctx.quadraticCurveTo(-14, 0, -12 + tailWag, -8);
      ctx.stroke();

    } else if (this.type === 'professor') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, 6, 4, 8); ctx.fillRect(2, 6, 4, 8);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-8, -6, 16, 14, 3);
      ctx.fill();
      ctx.fillStyle = '#ffdfba';
      ctx.beginPath();
      ctx.arc(0, -14, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-5, -16, 4, 3); ctx.strokeRect(1, -16, 4, 3);

    } else if (this.type === 'customer') {
      const wave = Math.sin(this.animTimer * 3) * 4;
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.roundRect(-8, -4, 16, 14, 3);
      ctx.fill();
      ctx.fillStyle = '#ffdfba';
      ctx.beginPath();
      ctx.arc(0, -13, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(0, -15, 10, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffdfba';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, -2);
      ctx.lineTo(14, -10 + wave);
      ctx.stroke();
    }

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 10px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, 0, -22);

    ctx.restore();
  }
}

window.Player = Player;
window.Motorcycle = Motorcycle;
window.TrafficVehicle = TrafficVehicle;
window.NPC = NPC;
