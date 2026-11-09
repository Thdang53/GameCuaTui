/**
 * World System - Bản đồ thế giới mở thành phố ban đêm phong cách Anime Cozy
 */
class WorldMap {
  constructor() {
    this.width = 3000;
    this.height = 2400;

    // Danh sách các tòa nhà & địa điểm đặc biệt
    this.locations = [
      {
        id: 'room',
        name: 'Phòng Trọ Sinh Viên',
        tag: '🏠 Nơi nghỉ ngơi & Viết Đồ Án',
        x: 180,
        y: 160,
        w: 280,
        h: 220,
        color: '#2d3748',
        roofColor: '#e53e3e',
        sign: 'PHÒNG TRỌ #402',
        door: { x: 320, y: 380 },
        type: 'residence'
      },
      {
        id: 'university',
        name: 'Trường Đại Học',
        tag: '🎓 Giảng Đường & Nộp Đồ Án',
        x: 950,
        y: 120,
        w: 480,
        h: 280,
        color: '#1a365d',
        roofColor: '#2b6cb0',
        sign: 'ĐẠI HỌC CÔNG NGHỆ 🎓',
        door: { x: 1190, y: 400 },
        type: 'school'
      },
      {
        id: 'com_tam',
        name: 'Quán Cơm Tấm Đêm',
        tag: '🍜 Điểm Lấy Đơn ShopeeFood',
        x: 2100,
        y: 160,
        w: 300,
        h: 220,
        color: '#742a2a',
        roofColor: '#c53030',
        sign: 'CƠM TẤM ĐÊM SÀI GÒN 🍖',
        door: { x: 2250, y: 380 },
        type: 'restaurant'
      },
      {
        id: 'tra_sua',
        name: 'Tiệm Trà Sữa Boba Cute',
        tag: '🧋 Điểm Lấy Đơn ShopeeFood',
        x: 2100,
        y: 780,
        w: 300,
        h: 220,
        color: '#702459',
        roofColor: '#b83280',
        sign: 'TIỆM BOBA COZY 🧋',
        door: { x: 2250, y: 1000 },
        type: 'cafe'
      },
      {
        id: 'chung_cu',
        name: 'Chung Cư Sakura',
        tag: '🏢 Điểm Giao Đơn Hàng #1',
        x: 180,
        y: 800,
        w: 320,
        h: 400,
        color: '#285e61',
        roofColor: '#319795',
        sign: 'CHUNG CƯ SAKURA 🏢',
        door: { x: 340, y: 1200 },
        type: 'apartment'
      },
      {
        id: 'ktx',
        name: 'Ký Túc Xá Sinh Viên',
        tag: '🏢 Điểm Giao Đơn Hàng #2',
        x: 2100,
        y: 1600,
        w: 340,
        h: 300,
        color: '#2c5282',
        roofColor: '#4299e1',
        sign: 'KÝ TÚC XÁ ĐẠI HỌC 🛌',
        door: { x: 2270, y: 1900 },
        type: 'dorm'
      }
    ];

    // Hệ thống đường bộ
    this.roads = [
      // Đại lộ ngang 1
      { x: 0, y: 460, w: 3000, h: 140, type: 'h' },
      // Đại lộ ngang 2
      { x: 0, y: 1350, w: 3000, h: 140, type: 'h' },
      // Tuyến đường dọc 1
      { x: 550, y: 0, w: 140, h: 2400, type: 'v' },
      // Tuyến đường dọc 2
      { x: 1800, y: 0, w: 140, h: 2400, type: 'v' }
    ];

    // Khu vực Công viên Sakura (x: 820, y: 720, w: 850, h: 540)
    this.park = {
      x: 800,
      y: 680,
      w: 880,
      h: 580,
      pond: { x: 1240, y: 970, rx: 170, ry: 100 }
    };

    // Đèn đường ban đêm
    this.streetLights = [
      { x: 500, y: 440 }, { x: 740, y: 440 }, { x: 1100, y: 440 }, { x: 1500, y: 440 }, { x: 1750, y: 440 }, { x: 2000, y: 440 }, { x: 2500, y: 440 },
      { x: 500, y: 620 }, { x: 740, y: 620 }, { x: 1750, y: 620 }, { x: 2000, y: 620 }, { x: 2500, y: 620 },
      { x: 500, y: 1330 }, { x: 740, y: 1330 }, { x: 1100, y: 1330 }, { x: 1500, y: 1330 }, { x: 1750, y: 1330 }, { x: 2000, y: 1330 }, { x: 2500, y: 1330 },
      { x: 500, y: 1510 }, { x: 740, y: 1510 }, { x: 1100, y: 1510 }, { x: 1500, y: 1510 }, { x: 1750, y: 1510 }, { x: 2000, y: 1510 }, { x: 2500, y: 1510 },
      { x: 530, y: 250 }, { x: 530, y: 800 }, { x: 530, y: 1100 }, { x: 530, y: 1800 }, { x: 530, y: 2100 },
      { x: 1780, y: 250 }, { x: 1780, y: 800 }, { x: 1780, y: 1100 }, { x: 1780, y: 1800 }, { x: 1780, y: 2100 },
      // Đèn công viên
      { x: 920, y: 780 }, { x: 1560, y: 780 }, { x: 920, y: 1180 }, { x: 1560, y: 1180 }
    ];

    // Cây hoa anh đào (Sakura Trees)
    this.sakuraTrees = [
      { x: 880, y: 760, r: 45 },
      { x: 1040, y: 740, r: 50 },
      { x: 1450, y: 750, r: 48 },
      { x: 1600, y: 780, r: 52 },
      { x: 870, y: 1140, r: 46 },
      { x: 1050, y: 1180, r: 54 },
      { x: 1480, y: 1160, r: 50 },
      { x: 1620, y: 1130, r: 48 },
      // Gần phòng trọ
      { x: 100, y: 240, r: 40 },
      // Gần trường đại học
      { x: 860, y: 200, r: 46 },
      { x: 1520, y: 200, r: 46 }
    ];

    // Hệ thống hạt cánh hoa anh đào bay trong gió (Sakura Petals)
    this.petals = [];
    for (let i = 0; i < 75; i++) {
      this.petals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 3 + Math.random() * 4,
        speedX: 0.6 + Math.random() * 1.2,
        speedY: 0.8 + Math.random() * 1.2,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: 0.02 + Math.random() * 0.04
      });
    }

    // Hệ thống thời tiết mưa đêm (Cozy Rain)
    this.isRaining = false;
    this.rainDrops = [];
    for (let i = 0; i < 220; i++) {
      this.rainDrops.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        len: 12 + Math.random() * 10,
        speed: 16 + Math.random() * 8
      });
    }
    this.puddleRipples = [];

    // Ghế đá công viên
    this.benches = [
      { x: 1020, y: 920, w: 50, h: 20 },
      { x: 1440, y: 920, w: 50, h: 20 },
      { x: 1240, y: 1140, w: 50, h: 20 }
    ];
  }

  // Cập nhật vị trí cánh hoa rơi & hạt mưa
  update() {
    for (const p of this.petals) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.angle += p.rotSpeed;

      if (p.y > this.height) {
        p.y = -20;
        p.x = Math.random() * this.width;
      }
      if (p.x > this.width) {
        p.x = -20;
      }
    }

    // Cập nhật hạt mưa & gợn sóng nước
    if (this.isRaining) {
      for (const r of this.rainDrops) {
        r.x -= 2.5;
        r.y += r.speed;
        if (r.y > this.height) {
          r.y = 0;
          r.x = Math.random() * this.width;
          if (Math.random() > 0.6) {
            this.puddleRipples.push({
              x: r.x,
              y: Math.random() * this.height,
              radius: 1,
              maxRadius: 6 + Math.random() * 6,
              alpha: 0.6
            });
          }
        }
      }

      this.puddleRipples.forEach(p => {
        p.radius += 0.5;
        p.alpha -= 0.035;
      });
      this.puddleRipples = this.puddleRipples.filter(p => p.alpha > 0);
    }
  }

  // Vẽ nền đất, đường xá, công viên
  renderGround(ctx, camera) {
    // 1. Nền cỏ đêm xanh thẫm
    ctx.fillStyle = '#111822';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Khu vực công viên (Thảm cỏ xanh tươi mát mẻ)
    ctx.fillStyle = '#163528';
    ctx.beginPath();
    ctx.roundRect(this.park.x, this.park.y, this.park.w, this.park.h, 24);
    ctx.fill();

    // Hồ nước công viên
    const pPond = this.park.pond;
    const pondGrad = ctx.createRadialGradient(pPond.x, pPond.y, 10, pPond.x, pPond.y, pPond.rx);
    pondGrad.addColorStop(0, '#1a365d');
    pondGrad.addColorStop(0.8, '#0f2942');
    pondGrad.addColorStop(1, '#091829');
    ctx.fillStyle = pondGrad;
    ctx.beginPath();
    ctx.ellipse(pPond.x, pPond.y, pPond.rx, pPond.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2b6cb0';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Vịt bơi hồ nước (dễ thương)
    ctx.fillStyle = '#ecc94b';
    ctx.beginPath();
    ctx.arc(pPond.x - 30, pPond.y - 15, 6, 0, Math.PI * 2);
    ctx.arc(pPond.x + 40, pPond.y + 20, 6, 0, Math.PI * 2);
    ctx.fill();

    // 3. Vẽ Vỉa Hè (Pavements) chạy dọc các đường
    ctx.fillStyle = '#262f40';
    for (const road of this.roads) {
      if (road.type === 'h') {
        // Vỉa hè trên & dưới
        ctx.fillRect(road.x, road.y - 18, road.w, 18);
        ctx.fillRect(road.x, road.y + road.h, road.w, 18);
      } else {
        // Vỉa hè trái & phải
        ctx.fillRect(road.x - 18, road.y, 18, road.h);
        ctx.fillRect(road.x + road.w, road.y, 18, road.h);
      }
    }

    // 4. Vẽ Mặt Đường Nhựa (Asphalt Roads)
    ctx.fillStyle = '#1e2430';
    for (const road of this.roads) {
      ctx.fillRect(road.x, road.y, road.w, road.h);
    }

    // 5. Vạch Kẻ Đường & Vạch Sang Đường (Lane Markers & Crosswalks)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);

    for (const road of this.roads) {
      ctx.beginPath();
      if (road.type === 'h') {
        ctx.moveTo(road.x, road.y + road.h / 2);
        ctx.lineTo(road.x + road.w, road.y + road.h / 2);
      } else {
        ctx.moveTo(road.x + road.w / 2, road.y);
        ctx.lineTo(road.x + road.w / 2, road.y + road.h);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]); // Bỏ nét đứt

    // Vẽ Vạch sang đường (Crosswalks) tại các ngã tư
    this.renderCrosswalk(ctx, 550, 460);
    this.renderCrosswalk(ctx, 1800, 460);
    this.renderCrosswalk(ctx, 550, 1350);
    this.renderCrosswalk(ctx, 1800, 1350);
  }

  // Vẽ vạch qua đường người đi bộ
  renderCrosswalk(ctx, x, y) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    // Ngang
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(x - 40, y + 10 + i * 18, 25, 10);
      ctx.fillRect(x + 140 + 15, y + 10 + i * 18, 25, 10);
    }
  }

  // Vẽ các công trình kiến trúc & Tòa nhà
  renderBuildings(ctx) {
    for (const b of this.locations) {
      // Bóng đổ tòa nhà
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(b.x + 12, b.y + 12, b.w, b.h);

      // Thân tòa nhà
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 12);
      ctx.fill();

      // Mái hiên / Mái nhà
      ctx.fillStyle = b.roofColor;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, 40, [12, 12, 0, 0]);
      ctx.fill();

      // Bảng hiệu neon rực rỡ
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(b.x + 15, b.y + 8, b.w - 30, 24);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.sign, b.x + b.w / 2, b.y + 24);

      // Cửa sổ sáng đèn đêm (cozy windows)
      const winCols = Math.floor((b.w - 40) / 45);
      const winRows = Math.floor((b.h - 80) / 45);
      for (let r = 0; r < winRows; r++) {
        for (let c = 0; c < winCols; c++) {
          const wx = b.x + 25 + c * 45;
          const wy = b.y + 55 + r * 45;

          // Cửa sổ ánh sáng vàng hoặc xanh
          const isWarm = (r + c) % 3 !== 0;
          ctx.fillStyle = isWarm ? 'rgba(254, 240, 138, 0.75)' : 'rgba(147, 197, 253, 0.6)';
          ctx.fillRect(wx, wy, 26, 26);

          // Khung cửa sổ
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.strokeRect(wx, wy, 26, 26);
        }
      }

      // Cửa ra vào & Thảm chào mừng
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(b.door.x - 22, b.y + b.h - 35, 44, 35);
      ctx.fillStyle = '#ecc94b';
      ctx.fillRect(b.door.x - 18, b.y + b.h - 6, 36, 6);

      // Nhãn tên địa điểm nổi bật dưới chân
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.roundRect(b.x, b.y + b.h + 6, b.w, 22, 6);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 11px Comfortaa, sans-serif';
      ctx.fillText(b.tag, b.x + b.w / 2, b.y + b.h + 21);
    }

    // Vẽ Ghế đá công viên
    for (const bn of this.benches) {
      ctx.fillStyle = '#8c522f';
      ctx.fillRect(bn.x, bn.y, bn.w, bn.h);
      ctx.strokeStyle = '#4a2c16';
      ctx.lineWidth = 2;
      ctx.strokeRect(bn.x, bn.y, bn.w, bn.h);
    }

    // Vẽ Cây hoa anh đào (Sakura Trees)
    for (const tree of this.sakuraTrees) {
      // Bóng râm gốc cây
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(tree.x, tree.y + 20, tree.r, tree.r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thân cây
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(tree.x - 6, tree.y - 10, 12, 30);

      // Tán lá hoa anh đào hồng bồng bềnh
      const grad = ctx.createRadialGradient(tree.x - 10, tree.y - 20, 5, tree.x, tree.y - 15, tree.r);
      grad.addColorStop(0, '#fbcfe8');
      grad.addColorStop(0.6, '#f472b6');
      grad.addColorStop(1, '#db2777');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(tree.x - 15, tree.y - 18, tree.r * 0.7, 0, Math.PI * 2);
      ctx.arc(tree.x + 15, tree.y - 15, tree.r * 0.75, 0, Math.PI * 2);
      ctx.arc(tree.x, tree.y - 30, tree.r * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Vẽ ánh sáng đèn đường (Warm Streetlight Glows)
  renderLights(ctx) {
    for (const light of this.streetLights) {
      // Cột đèn
      ctx.fillStyle = '#475569';
      ctx.fillRect(light.x - 2, light.y - 25, 4, 25);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(light.x, light.y - 25, 5, 0, Math.PI * 2);
      ctx.fill();

      // Vầng sáng ấm áp trên mặt đường
      const glow = ctx.createRadialGradient(light.x, light.y, 5, light.x, light.y, 90);
      glow.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
      glow.addColorStop(0.5, 'rgba(254, 240, 138, 0.08)');
      glow.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(light.x, light.y, 90, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Vẽ cánh hoa anh đào bay (Petals)
  renderPetals(ctx) {
    ctx.fillStyle = 'rgba(244, 114, 182, 0.85)';
    for (const p of this.petals) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Vẽ hạt mưa & gợn sóng nước (Rain System)
  renderRain(ctx) {
    if (!this.isRaining) return;

    // Vệt mưa rơi nghiêng
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (const r of this.rainDrops) {
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - 4, r.y + r.len);
    }
    ctx.stroke();

    // Vòng tròn gợn sóng nước loang trên mặt đất
    for (const p of this.puddleRipples) {
      ctx.strokeStyle = `rgba(186, 230, 253, ${p.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.radius, p.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Kiểm tra va chạm với các tòa nhà
  checkCollision(x, y, radius = 16) {
    // Ranh giới bản đồ
    if (x - radius < 0 || x + radius > this.width || y - radius < 0 || y + radius > this.height) {
      return true;
    }

    // Ranh giới các tòa nhà
    for (const b of this.locations) {
      if (
        x + radius > b.x &&
        x - radius < b.x + b.w &&
        y + radius > b.y &&
        y - radius < b.y + b.h
      ) {
        return true;
      }
    }

    // Hồ nước công viên
    const dx = (x - this.park.pond.x) / (this.park.pond.rx * 0.95);
    const dy = (y - this.park.pond.y) / (this.park.pond.ry * 0.95);
    if (dx * dx + dy * dy < 1) {
      return true;
    }

    return false;
  }
}

window.WorldMap = WorldMap;
