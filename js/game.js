/**
 * Main Game Controller - Điều khiển trung tâm, Game Loop 60 FPS, Camera & Minimap
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.minimapCanvas = document.getElementById('minimapCanvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');

    this.keys = {};
    this.lastTime = 0;

    // Camera mượt mà theo nhân vật với 3 chế độ góc nhìn chuẩn GTA
    this.camera = {
      x: 320,
      y: 420,
      targetX: 320,
      targetY: 420,
      zoom: 1.0,
      targetZoom: 1.0,
      mode: 0 // 0: Dynamic GTA, 1: Close-up Chibi, 2: Bird's Eye View
    };

    this.cameraModes = [
      { id: 0, name: 'Dynamic GTA 🎥', baseZoom: 1.0, hasLookAhead: true },
      { id: 1, name: 'Cận Cảnh (Chibi) 🔍', baseZoom: 1.35, hasLookAhead: false },
      { id: 2, name: 'Toàn Cảnh (Flycam) 🚁', baseZoom: 0.72, hasLookAhead: true }
    ];

    // Khởi tạo các hệ thống
    this.world = new WorldMap();
    this.player = new Player(320, 420); // Xuất phát trước cửa phòng trọ
    this.motorcycle = new Motorcycle(390, 440); // Đậu xe bên vỉa hè
    this.quests = new QuestManager(this);

    // Danh sách NPCs
    this.npcs = [
      new NPC({
        id: 'cat_park',
        name: 'Bé Mèo Mướp 🐱',
        type: 'cat',
        x: 1100,
        y: 920,
        avatar: '🐱',
        dialogue: [
          '"Meow meow~ Cả ngày chạy đơn và làm đồ án vất vả rồi, lại đây xoa đầu tui đi bạn ơi!"'
        ]
      }),
      new NPC({
        id: 'prof',
        name: 'Thầy Hướng Dẫn 👨‍🏫',
        type: 'professor',
        x: 1190,
        y: 420,
        avatar: '👨‍🏫',
        dialogue: [
          '"Chào Đăng! Ráng lên em nhé, sinh viên năm 4 vất vả nhưng tương lai sẽ rất sáng lạn!"'
        ]
      }),
      new NPC({
        id: 'customer_sakura',
        name: 'Bạn Nữ Ôn Thi 👧',
        type: 'customer',
        x: 340,
        y: 1220,
        avatar: '👧',
        dialogue: [
          '"Đang đói bụng học bài mà được anh shipper giao cơm tận cửa, cảm ơn anh nhiều!"'
        ]
      }),
      new NPC({
        id: 'customer_ktx',
        name: 'Sinh Viên KTX 🎒',
        type: 'customer',
        x: 2270,
        y: 1920,
        avatar: '🎒',
        dialogue: [
          '"Trà sữa ngọt lịm cứu cánh cả nhóm đêm nay, 10 sao cho ShopeeFood!"'
        ]
      })
    ];

    this.initEvents();
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Bắt đầu vòng lặp
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initEvents() {
    // Bắt phím bàn phím
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Phím E: Tương tác chính
      if (e.code === 'KeyE') {
        this.handleInteraction();
      }

      // Phím V: Đổi góc nhìn Camera
      if (e.code === 'KeyV') {
        this.toggleCameraMode();
      }

      // Phím H: Còi xe máy
      if (e.code === 'KeyH') {
        if (this.player.isRiding) {
          window.soundEngine.playHorn();
        }
      }

      // Phím F: Thả tim
      if (e.code === 'KeyF') {
        this.player.triggerHeart();
        window.soundEngine.playSparkle();
      }

      // Phím M: Bật/Tắt Lofi
      if (e.code === 'KeyM') {
        this.toggleLofi();
      }

      // Phím Space: Đóng hộp thoại
      if (e.code === 'Space') {
        this.closeDialog();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // UI Buttons
    const btnCam = document.getElementById('btn-toggle-camera');
    if (btnCam) {
      btnCam.addEventListener('click', () => this.toggleCameraMode());
    }

    const btnMusic = document.getElementById('btn-toggle-music');
    if (btnMusic) {
      btnMusic.addEventListener('click', () => this.toggleLofi());
    }

    const btnSfx = document.getElementById('btn-toggle-sfx');
    if (btnSfx) {
      btnSfx.addEventListener('click', () => {
        window.soundEngine.sfxEnabled = !window.soundEngine.sfxEnabled;
        btnSfx.innerHTML = window.soundEngine.sfxEnabled
          ? '<span class="audio-icon">🔊</span> SFX: Bật'
          : '<span class="audio-icon">🔇</span> SFX: Tắt';
      });
    }

    // Đóng dialog khi click
    const dialogBox = document.getElementById('dialog-box');
    if (dialogBox) {
      dialogBox.addEventListener('click', () => this.closeDialog());
    }
  }

  toggleCameraMode() {
    this.camera.mode = (this.camera.mode + 1) % this.cameraModes.length;
    const mode = this.cameraModes[this.camera.mode];
    const btnText = document.getElementById('camera-status-text');
    if (btnText) {
      btnText.innerText = `Góc Nhìn: ${mode.name}`;
    }
    this.showToast('GÓC NHÌN CAMERA 🎥', `Đã chuyển sang chế độ: ${mode.name}`);
    window.soundEngine.playSparkle();
  }

  toggleLofi() {
    const btnMusic = document.getElementById('btn-toggle-music');
    const txtMusic = document.getElementById('music-status-text');
    if (window.soundEngine.musicEnabled) {
      window.soundEngine.stopLofiMusic();
      btnMusic.classList.remove('active');
      txtMusic.innerText = 'Lofi: Đang Tắt';
    } else {
      window.soundEngine.startLofiMusic();
      btnMusic.classList.add('active');
      txtMusic.innerText = 'Lofi: Đang Phát 🎶';
    }
  }

  // Xử lý khi nhấn phím [E]
  handleInteraction() {
    // 1. Nếu đang mở hộp thoại thì đóng lại
    const dialogBox = document.getElementById('dialog-box');
    if (!dialogBox.classList.contains('hidden')) {
      this.closeDialog();
      return;
    }

    // 2. Thử hoàn thành nhiệm vụ tại vị trí hiện tại
    if (this.quests.tryCompleteCurrentQuest(this.player)) {
      return;
    }

    // 3. Kiểm tra lên/xuống xe máy ShopeeFood
    const distToBike = Math.hypot(this.player.x - this.motorcycle.x, this.player.y - this.motorcycle.y);
    if (this.player.isRiding) {
      this.player.dismountVehicle();
      this.showToast('XUỐNG XE 🚶', 'Đã xuống xe máy ShopeeFood đi bộ.');
      return;
    } else if (distToBike < 45) {
      this.player.mountVehicle(this.motorcycle);
      this.quests.checkProgress(this.player, this.motorcycle);
      window.soundEngine.playSparkle();
      this.showToast('LÊN XE MÁY 🛵', 'Sẵn sàng lượn phố! Nhấn [H] để bóp còi.');
      return;
    }

    // 4. Kiểm tra tương tác với NPC xung quanh
    for (const npc of this.npcs) {
      const dist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
      if (dist < 50) {
        if (npc.type === 'cat') {
          this.player.triggerHeart();
          window.soundEngine.playMeow();
        }
        const text = npc.dialogue[0];
        this.showDialog(npc.name, npc.avatar, text);
        return;
      }
    }
  }

  showDialog(speaker, avatar, message) {
    const box = document.getElementById('dialog-box');
    document.getElementById('dialog-speaker').innerText = speaker;
    document.getElementById('dialog-avatar').innerText = avatar;
    document.getElementById('dialog-message').innerText = message;
    box.classList.remove('hidden');
  }

  closeDialog() {
    const box = document.getElementById('dialog-box');
    box.classList.add('hidden');
  }

  showToast(title, desc) {
    const toast = document.getElementById('toast-notify');
    document.getElementById('toast-title').innerText = title;
    document.getElementById('toast-desc').innerText = desc;
    toast.classList.remove('hidden');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 4000);
  }

  update() {
    // 1. Cập nhật thế giới (hoa rơi)
    this.world.update();

    // 2. Cập nhật Player & Xe
    this.player.update(this.keys, this.world);
    if (!this.player.isRiding) {
      this.motorcycle.update(this.keys, this.world);
    }

    // 3. Cập nhật NPCs
    for (const npc of this.npcs) {
      npc.update();
    }

    // 4. Kiểm tra tiến độ nhiệm vụ
    this.quests.checkProgress(this.player, this.motorcycle);

    // 5. Cập nhật Camera theo góc nhìn và tốc độ xe (GTA Dynamic Camera)
    const curMode = this.cameraModes[this.camera.mode];
    let focusX = this.player.x;
    let focusY = this.player.y;

    // Look-ahead: Khi lái xe hoặc chạy nhanh, camera nhìn xa về phía trước theo hướng di chuyển
    if (curMode.hasLookAhead) {
      if (this.player.isRiding) {
        const leadDist = this.motorcycle.speed * 25; // xe phóng càng nhanh, camera nhìn càng xa phía trước
        focusX += Math.cos(this.motorcycle.angle) * leadDist;
        focusY += Math.sin(this.motorcycle.angle) * leadDist;
      } else if (this.player.isSprinting && this.player.isMoving) {
        const leadDirs = { up: [0, -50], down: [0, 50], left: [-50, 0], right: [50, 0] };
        const d = leadDirs[this.player.facing] || [0, 0];
        focusX += d[0];
        focusY += d[1];
      }
    }

    // Dynamic Zoom: Khi lái xe tốc độ cao ở chế độ Dynamic GTA, zoom out nhẹ tạo cảm giác lướt gió tốc độ
    let desiredZoom = curMode.baseZoom;
    if (this.camera.mode === 0 && this.player.isRiding) {
      const speedRatio = Math.abs(this.motorcycle.speed) / this.motorcycle.maxSpeed;
      desiredZoom = 1.05 - speedRatio * 0.16; // 1.05x -> 0.89x
    }

    this.camera.targetZoom = desiredZoom;
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.08;

    this.camera.targetX = focusX;
    this.camera.targetY = focusY;

    this.camera.x += (this.camera.targetX - this.camera.x) * 0.08;
    this.camera.y += (this.camera.targetY - this.camera.y) * 0.08;

    // Giới hạn camera trong thế giới
    this.camera.x = Math.max(100, Math.min(this.camera.x, this.world.width - 100));
    this.camera.y = Math.max(100, Math.min(this.camera.y, this.world.height - 100));

    // 6. Cập nhật UI & Gợi ý tương tác (Prompt)
    this.updateUI();
  }

  updateUI() {
    // Cập nhật tiền & tinh thần
    document.getElementById('money-display').innerText = this.player.money.toLocaleString('vi-VN') + ' đ';
    document.getElementById('energy-text').innerText = `Tinh thần: ${Math.floor(this.player.energy)}%`;
    document.getElementById('energy-bar-fill').style.width = `${this.player.energy}%`;

    // Kiểm tra gợi ý tương tác
    const prompt = document.getElementById('interact-prompt');
    const promptText = document.getElementById('interact-text');

    const curQuest = this.quests.getCurrentQuest();
    let promptMsg = null;

    if (this.player.isRiding) {
      promptMsg = 'Xuống xe máy [E]';
    } else {
      const distToBike = Math.hypot(this.player.x - this.motorcycle.x, this.player.y - this.motorcycle.y);
      if (distToBike < 45) {
        promptMsg = 'Lên xe máy ShopeeFood [E]';
      }
    }

    // Nếu gần NPC
    if (!promptMsg) {
      for (const npc of this.npcs) {
        const dist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
        if (dist < 50) {
          promptMsg = npc.type === 'cat' ? 'Xoa đầu Bé Mèo [E]' : `Trò chuyện với ${npc.name} [E]`;
          break;
        }
      }
    }

    // Nếu ở điểm nhiệm vụ
    if (!promptMsg && curQuest && curQuest.type !== 'endless') {
      const distToTarget = Math.hypot(this.player.x - curQuest.targetX, this.player.y - curQuest.targetY);
      if (distToTarget <= curQuest.targetRadius) {
        if (curQuest.type === 'pickup') promptMsg = 'Nhận đơn hàng ShopeeFood [E]';
        else if (curQuest.type === 'deliver') promptMsg = 'Giao hàng cho khách [E]';
        else if (curQuest.type === 'story') promptMsg = 'Gặp Thầy nộp Đồ Án [E]';
        else if (curQuest.type === 'heal') promptMsg = 'Chữa lành & Ôm mèo [E]';
      }
    }

    if (promptMsg) {
      promptText.innerText = promptMsg;
      prompt.classList.remove('hidden');
    } else {
      prompt.classList.add('hidden');
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    // Di chuyển màn hình theo Camera và áp dụng Zoom mượt mà
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

    // 1. Mặt đất, đường xá, công viên
    this.world.renderGround(ctx, this.camera);

    // 2. Tòa nhà & Công trình
    this.world.renderBuildings(ctx);

    // 3. Điểm đánh dấu nhiệm vụ trên mặt đất (Pulsing Quest Marker)
    this.renderQuestMarker(ctx);

    // 4. Xe máy ShopeeFood
    this.motorcycle.render(ctx);

    // 5. NPCs
    for (const npc of this.npcs) {
      npc.render(ctx);
    }

    // 6. Nhân vật Người chơi (Player)
    this.player.render(ctx);

    // 7. Ánh sáng đèn đường đêm
    this.world.renderLights(ctx);

    // 8. Cánh hoa anh đào rơi theo gió
    this.world.renderPetals(ctx);

    ctx.restore();

    // 9. Vẽ Minimap Radar góc màn hình
    this.renderMinimap();
  }

  renderQuestMarker(ctx) {
    const q = this.quests.getCurrentQuest();
    if (!q || q.type === 'endless' || q.targetRadius === 0) return;

    const time = Date.now() * 0.003;
    const pulseR = q.targetRadius + Math.sin(time) * 8;

    // Vòng tròn ánh sáng tỏa nhịp
    ctx.strokeStyle = '#ee4d2d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(q.targetX, q.targetY, pulseR, 0, Math.PI * 2);
    ctx.stroke();

    // Vệt sáng tâm
    ctx.fillStyle = 'rgba(238, 77, 45, 0.25)';
    ctx.beginPath();
    ctx.arc(q.targetX, q.targetY, pulseR, 0, Math.PI * 2);
    ctx.fill();

    // Biểu tượng mục tiêu
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📍', q.targetX, q.targetY - pulseR - 6);
  }

  // Vẽ Minimap Radar chuẩn GTA
  renderMinimap() {
    const mCtx = this.minimapCtx;
    const mW = this.minimapCanvas.width;
    const mH = this.minimapCanvas.height;

    mCtx.clearRect(0, 0, mW, mH);

    // Bán kính radar
    const radarRadius = mW / 2;
    const scale = 0.085; // Tỉ lệ thu nhỏ

    mCtx.save();
    // Cắt theo hình tròn
    mCtx.beginPath();
    mCtx.arc(radarRadius, radarRadius, radarRadius - 2, 0, Math.PI * 2);
    mCtx.clip();

    // Nền minimap
    mCtx.fillStyle = '#0a0d14';
    mCtx.fillRect(0, 0, mW, mH);

    // Tâm minimap là vị trí Player
    mCtx.translate(radarRadius, radarRadius);

    // Vẽ đường bộ thu nhỏ
    mCtx.fillStyle = '#1e293b';
    for (const r of this.world.roads) {
      const rx = (r.x - this.player.x) * scale;
      const ry = (r.y - this.player.y) * scale;
      mCtx.fillRect(rx, ry, r.w * scale, r.h * scale);
    }

    // Công viên thu nhỏ
    mCtx.fillStyle = '#14532d';
    const px = (this.world.park.x - this.player.x) * scale;
    const py = (this.world.park.y - this.player.y) * scale;
    mCtx.fillRect(px, py, this.world.park.w * scale, this.world.park.h * scale);

    // Các tòa nhà thu nhỏ
    for (const b of this.world.locations) {
      const bx = (b.x - this.player.x) * scale;
      const by = (b.y - this.player.y) * scale;
      mCtx.fillStyle = b.roofColor;
      mCtx.fillRect(bx, by, b.w * scale, b.h * scale);
    }

    // Xe máy trên Minimap (chấm vàng)
    if (!this.player.isRiding) {
      const vx = (this.motorcycle.x - this.player.x) * scale;
      const vy = (this.motorcycle.y - this.player.y) * scale;
      mCtx.fillStyle = '#f59e0b';
      mCtx.beginPath();
      mCtx.arc(vx, vy, 4, 0, Math.PI * 2);
      mCtx.fill();
    }

    // Điểm nhiệm vụ trên Minimap (chấm đỏ cam nhấp nháy)
    const q = this.quests.getCurrentQuest();
    if (q && q.type !== 'endless' && q.targetRadius > 0) {
      const qx = (q.targetX - this.player.x) * scale;
      const qy = (q.targetY - this.player.y) * scale;

      // Giới hạn trong viền radar nếu ở quá xa
      const dist = Math.hypot(qx, qy);
      const maxR = radarRadius - 12;
      let finalX = qx;
      let finalY = qy;
      if (dist > maxR) {
        finalX = (qx / dist) * maxR;
        finalY = (qy / dist) * maxR;
      }

      mCtx.fillStyle = '#ee4d2d';
      mCtx.beginPath();
      mCtx.arc(finalX, finalY, 5, 0, Math.PI * 2);
      mCtx.fill();
      mCtx.strokeStyle = '#ffffff';
      mCtx.lineWidth = 1.5;
      mCtx.stroke();
    }

    // Người chơi ở chính giữa Minimap (mũi tên định hướng)
    mCtx.fillStyle = '#38bdf8';
    mCtx.beginPath();
    mCtx.arc(0, 0, 4, 0, Math.PI * 2);
    mCtx.fill();
    mCtx.strokeStyle = '#ffffff';
    mCtx.lineWidth = 2;
    mCtx.stroke();

    mCtx.restore();

    // Vạch viền radar
    mCtx.strokeStyle = 'rgba(238, 77, 45, 0.6)';
    mCtx.lineWidth = 2;
    mCtx.beginPath();
    mCtx.arc(radarRadius, radarRadius, radarRadius - 2, 0, Math.PI * 2);
    mCtx.stroke();
  }

  gameLoop(timestamp) {
    this.update();
    this.render();
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Khởi động game khi tải trang
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
