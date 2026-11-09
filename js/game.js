/**
 * Main Game Controller - Điều khiển trung tâm, Game Loop 60 FPS, Camera, Góc Nhìn POV & Minigame
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.minimapCanvas = document.getElementById('minimapCanvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');

    this.keys = {};
    this.lastTime = 0;

    // Camera mượt mà theo nhân vật với 4 chế độ góc nhìn
    this.camera = {
      x: 320,
      y: 420,
      targetX: 320,
      targetY: 420,
      zoom: 1.0,
      targetZoom: 1.0,
      mode: 0 // 0: Dynamic GTA, 1: POV Cockpit, 2: Close-up Chibi, 3: Flycam
    };

    this.cameraModes = [
      { id: 0, name: 'Dynamic GTA 🎥', baseZoom: 1.0, hasLookAhead: true },
      { id: 1, name: 'Buồng Lái POV 🛵', baseZoom: 1.15, hasLookAhead: true, isCockpit: true },
      { id: 2, name: 'Cận Cảnh (Chibi) 🔍', baseZoom: 1.35, hasLookAhead: false },
      { id: 3, name: 'Toàn Cảnh (Flycam) 🚁', baseZoom: 0.72, hasLookAhead: true }
    ];

    // Khởi tạo các hệ thống
    this.world = new WorldMap();
    this.player = new Player(320, 420); // Xuất phát trước cửa phòng trọ
    this.motorcycle = new Motorcycle(390, 440); // Đậu xe bên vỉa hè
    this.quests = new QuestManager(this);

    // Vị trí bàn học máy tính trong phòng trọ
    this.studyDesk = { x: 260, y: 360 };

    // Xe cộ giao thông đường phố
    this.traffic = [
      new TrafficVehicle({ id: 'bus_08', type: 'bus', x: 200, y: 1400, speed: 2.2, dir: 1, startX: 0, endX: 3000 }),
      new TrafficVehicle({ id: 'colleague_shipper', type: 'scooter', x: 2600, y: 510, speed: 3.5, dir: -1, startX: 0, endX: 3000 })
    ];

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
    this.initThesisMinigame();
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

      // Phím R: Đổi thời tiết mưa / đêm sao
      if (e.code === 'KeyR') {
        this.toggleWeather();
      }

      // Phím C: Đổi màu sơn xe máy
      if (e.code === 'KeyC') {
        this.cycleVehicleColor();
      }

      // Phím H: Còi xe máy / Vịt vàng kêu quạc quạc
      if (e.code === 'KeyH') {
        if (this.player.isRiding) {
          this.motorcycle.triggerDuck();
          window.soundEngine.playDuckQuack();
          this.showToast('VỊT VÀNG KÊU QUẠC! 🦆', 'Chú vịt vàng lắc lư kêu bíp bíp!');
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

    const btnWeather = document.getElementById('btn-toggle-weather');
    if (btnWeather) {
      btnWeather.addEventListener('click', () => this.toggleWeather());
    }

    const btnColor = document.getElementById('btn-toggle-color');
    if (btnColor) {
      btnColor.addEventListener('click', () => this.cycleVehicleColor());
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

  // Minigame Viết Đồ Án Tốt Nghiệp Bằng Bàn Phím Cơ
  initThesisMinigame() {
    this.thesisProgress = 0;
    this.thesisTextIndex = 0;
    this.thesisLines = [
      "\\section{Lời Mở Đầu & Mục Tiêu Nghiên Cứu}",
      "Đề tài: Ứng Dụng Thuật Toán Định Tuyến Tối Ưu Cho Shipper ShopeeFood.",
      "Sinh viên thực hiện: Nguyễn Hải Đăng - MSSV: 2022xxxx (Năm 4).",
      "Giảng viên hướng dẫn: TS. Trần Văn Thầy.",
      "\\subsection{Động lực thực tế}",
      "Là một sinh viên năm 4 vừa học vừa chạy ShopeeFood trang trải cuộc sống...",
      "Tôi nhận thấy việc cân bằng giữa học tập và mưu sinh rèn luyện ý chí phi thường.",
      "\\subsection{Thiết kế hệ thống và Kiến trúc phần mềm}",
      "Xây dựng thuật toán Dijkstra tìm đường ngắn nhất qua các quán ăn và điểm giao...",
      "Hệ thống đạt hiệu năng 99.8% đáp ứng thời gian thực dưới 50ms.",
      "\\subsection{Kết quả kiểm thử & Đánh giá thực nghiệm}",
      "Thời gian giao trà sữa và cơm sườn giảm 25%, khách hàng đánh giá 5 sao ⭐⭐⭐⭐⭐.",
      "Tối ưu mức tiêu thụ nhiên liệu xe máy, bảo vệ môi trường và tăng thu nhập.",
      "\\section{Kết Luận & Tri Ân}",
      "Lời cảm ơn chân thành đến bản thân vì đã không bao giờ bỏ cuộc dù có những đêm mệt mỏi.",
      "Đồ án tốt nghiệp hoàn thành xuất sắc! Tương lai tươi sáng đang chờ đón phía trước! 🎉"
    ];

    window.addEventListener('keydown', (e) => {
      const modal = document.getElementById('thesis-modal');
      if (modal && !modal.classList.contains('hidden')) {
        if (e.code === 'Escape') {
          this.closeThesisModal();
          return;
        }
        // Gõ phím bất kỳ tăng tiến độ
        this.stepThesis();
      }
    });

    const btnClose = document.getElementById('btn-close-thesis');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.closeThesisModal());
    }
  }

  openThesisModal() {
    const modal = document.getElementById('thesis-modal');
    modal.classList.remove('hidden');
    window.soundEngine.playSparkle();
  }

  closeThesisModal() {
    const modal = document.getElementById('thesis-modal');
    modal.classList.add('hidden');
  }

  stepThesis() {
    if (this.thesisProgress >= 100) return;

    this.thesisProgress = Math.min(100, this.thesisProgress + 4);
    window.soundEngine.playKeyClick();

    document.getElementById('thesis-percent').innerText = `${this.thesisProgress}%`;
    document.getElementById('thesis-bar-fill').style.width = `${this.thesisProgress}%`;

    const editor = document.getElementById('thesis-editor-content');
    const line = this.thesisLines[this.thesisTextIndex % this.thesisLines.length];
    this.thesisTextIndex++;

    const p = document.createElement('div');
    p.innerText = `> ${line}`;
    editor.insertBefore(p, editor.lastElementChild);
    editor.scrollTop = editor.scrollHeight;

    if (this.thesisProgress >= 100) {
      window.soundEngine.playCoin();
      window.soundEngine.playSparkle();
      this.player.energy = 100;
      this.player.money += 100000;
      this.showToast('TỐT NGHIỆP XUẤT SẮC! 🎓🎉', 'Bạn đạt điểm 10 Đồ Án Tốt Nghiệp! Nhận thưởng học bổng 100.000đ.');
    }
  }

  // Đổi màu xe máy
  cycleVehicleColor() {
    const name = this.motorcycle.cycleColor();
    this.showToast('SƠN MÀU XE MÁY 🎨', `Đã sơn màu mới: ${name}`);
    window.soundEngine.playSparkle();
  }

  // Đổi thời tiết (Mưa đêm / Trời sao)
  toggleWeather() {
    this.world.isRaining = !this.world.isRaining;
    const txt = document.getElementById('weather-status-text');
    if (this.world.isRaining) {
      if (txt) txt.innerText = 'Trời: Mưa Đêm 🌧️';
      window.soundEngine.startRainSound();
      this.showToast('THỜI TIẾT 🌧️', 'Cơn mưa đêm tí tách rơi. Khoác áo mưa và chill nào!');
    } else {
      if (txt) txt.innerText = 'Trời: Trăng Sao 🌙';
      window.soundEngine.stopRainSound();
      this.showToast('THỜI TIẾT 🌙', 'Mưa tạnh, bầu trời đêm lấp lánh muôn ngàn ánh sao.');
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
      txtMusic.innerText = 'Lofi: Tắt';
    } else {
      window.soundEngine.startLofiMusic();
      btnMusic.classList.add('active');
      txtMusic.innerText = 'Lofi: Bật 🎶';
    }
  }

  // Xử lý khi nhấn phím [E]
  handleInteraction() {
    // 1. Đóng dialog nếu đang mở
    const dialogBox = document.getElementById('dialog-box');
    if (!dialogBox.classList.contains('hidden')) {
      this.closeDialog();
      return;
    }

    // 2. Mở minigame Đồ án nếu ở bàn học phòng trọ
    const distToDesk = Math.hypot(this.player.x - this.studyDesk.x, this.player.y - this.studyDesk.y);
    if (!this.player.isRiding && distToDesk < 65) {
      this.openThesisModal();
      return;
    }

    // 3. Thử hoàn thành nhiệm vụ tại vị trí hiện tại
    if (this.quests.tryCompleteCurrentQuest(this.player)) {
      return;
    }

    // 4. Kiểm tra lên/xuống xe máy ShopeeFood
    const distToBike = Math.hypot(this.player.x - this.motorcycle.x, this.player.y - this.motorcycle.y);
    if (this.player.isRiding) {
      this.player.dismountVehicle();
      this.showToast('XUỐNG XE 🚶', 'Đã xuống xe máy ShopeeFood đi bộ.');
      return;
    } else if (distToBike < 45) {
      this.player.mountVehicle(this.motorcycle);
      this.quests.checkProgress(this.player, this.motorcycle);
      window.soundEngine.playSparkle();
      this.showToast('LÊN XE MÁY 🛵', 'Sẵn sàng lượn phố! Nhấn [V] đổi góc nhìn, [H] bóp còi vịt.');
      return;
    }

    // 5. Tương tác NPC
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
    // 1. Cập nhật thế giới
    this.world.update();

    // 2. Cập nhật Player & Xe
    this.player.update(this.keys, this.world);
    if (!this.player.isRiding) {
      this.motorcycle.update(this.keys, this.world);
    }

    // 3. Cập nhật Xe cộ giao thông
    for (const t of this.traffic) {
      t.update();
    }

    // 4. Cập nhật NPCs
    for (const npc of this.npcs) {
      npc.update();
    }

    // 5. Kiểm tra tiến độ nhiệm vụ
    this.quests.checkProgress(this.player, this.motorcycle);

    // 6. Cập nhật Camera theo góc nhìn và tốc độ xe (GTA Dynamic & POV Cockpit)
    const curMode = this.cameraModes[this.camera.mode];
    let focusX = this.player.x;
    let focusY = this.player.y;

    if (curMode.hasLookAhead) {
      if (this.player.isRiding) {
        // Tầm nhìn xa về phía trước theo hướng xe chạy
        const leadDist = curMode.isCockpit ? this.motorcycle.speed * 32 : this.motorcycle.speed * 25;
        focusX += Math.cos(this.motorcycle.angle) * leadDist;
        focusY += Math.sin(this.motorcycle.angle) * leadDist;
      } else if (this.player.isSprinting && this.player.isMoving) {
        const leadDirs = { up: [0, -50], down: [0, 50], left: [-50, 0], right: [50, 0] };
        const d = leadDirs[this.player.facing] || [0, 0];
        focusX += d[0];
        focusY += d[1];
      }
    }

    let desiredZoom = curMode.baseZoom;
    if (this.camera.mode === 0 && this.player.isRiding) {
      const speedRatio = Math.abs(this.motorcycle.speed) / this.motorcycle.maxSpeed;
      desiredZoom = 1.05 - speedRatio * 0.16;
    }

    this.camera.targetZoom = desiredZoom;
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.08;

    this.camera.targetX = focusX;
    this.camera.targetY = focusY;

    this.camera.x += (this.camera.targetX - this.camera.x) * 0.08;
    this.camera.y += (this.camera.targetY - this.camera.y) * 0.08;

    this.camera.x = Math.max(100, Math.min(this.camera.x, this.world.width - 100));
    this.camera.y = Math.max(100, Math.min(this.camera.y, this.world.height - 100));

    // 7. Cập nhật UI & Gợi ý tương tác (Prompt)
    this.updateUI();
  }

  updateUI() {
    document.getElementById('money-display').innerText = this.player.money.toLocaleString('vi-VN') + ' đ';
    document.getElementById('energy-text').innerText = `Tinh thần: ${Math.floor(this.player.energy)}%`;
    document.getElementById('energy-bar-fill').style.width = `${this.player.energy}%`;

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

    // Bàn học gõ đồ án
    if (!promptMsg && !this.player.isRiding) {
      const distToDesk = Math.hypot(this.player.x - this.studyDesk.x, this.player.y - this.studyDesk.y);
      if (distToDesk < 65) {
        promptMsg = 'Mở Laptop gõ Đồ Án Năm 4 [E]';
      }
    }

    // NPC
    if (!promptMsg) {
      for (const npc of this.npcs) {
        const dist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
        if (dist < 50) {
          promptMsg = npc.type === 'cat' ? 'Xoa đầu Bé Mèo [E]' : `Trò chuyện với ${npc.name} [E]`;
          break;
        }
      }
    }

    // Điểm nhiệm vụ
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
    // Di chuyển màn hình theo Camera và áp dụng Zoom
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

    // 1. Mặt đất, đường xá, công viên
    this.world.renderGround(ctx, this.camera);

    // 2. Tòa nhà & Công trình
    this.world.renderBuildings(ctx);

    // 3. Điểm đánh dấu nhiệm vụ
    this.renderQuestMarker(ctx);

    // 4. Xe cộ giao thông đường phố
    for (const t of this.traffic) {
      t.render(ctx);
    }

    // 5. Xe máy ShopeeFood
    this.motorcycle.render(ctx, this.world.isRaining);

    // 6. NPCs
    for (const npc of this.npcs) {
      npc.render(ctx);
    }

    // 7. Nhân vật Người chơi
    this.player.render(ctx, this.world.isRaining);

    // 8. Ánh sáng đèn đường đêm
    this.world.renderLights(ctx);

    // 9. Cánh hoa anh đào rơi theo gió
    this.world.renderPetals(ctx);

    // 10. Mưa rơi trên thế giới
    this.world.renderRain(ctx);

    ctx.restore();

    // 11. Góc nhìn buồng lái thứ nhất (First-Person POV Cockpit View)
    const curMode = this.cameraModes[this.camera.mode];
    if (curMode.isCockpit && this.player.isRiding) {
      this.motorcycle.renderCockpit(ctx, this.canvas.width, this.canvas.height, this.quests.getCurrentQuest());
    }

    // 12. Minimap Radar góc màn hình
    this.renderMinimap();
  }

  renderQuestMarker(ctx) {
    const q = this.quests.getCurrentQuest();
    if (!q || q.type === 'endless' || q.targetRadius === 0) return;

    const time = Date.now() * 0.003;
    const pulseR = q.targetRadius + Math.sin(time) * 8;

    ctx.strokeStyle = '#ee4d2d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(q.targetX, q.targetY, pulseR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(238, 77, 45, 0.25)';
    ctx.beginPath();
    ctx.arc(q.targetX, q.targetY, pulseR, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📍', q.targetX, q.targetY - pulseR - 6);
  }

  renderMinimap() {
    const mCtx = this.minimapCtx;
    const mW = this.minimapCanvas.width;
    const mH = this.minimapCanvas.height;

    mCtx.clearRect(0, 0, mW, mH);

    const radarRadius = mW / 2;
    const scale = 0.085;

    mCtx.save();
    mCtx.beginPath();
    mCtx.arc(radarRadius, radarRadius, radarRadius - 2, 0, Math.PI * 2);
    mCtx.clip();

    mCtx.fillStyle = '#0a0d14';
    mCtx.fillRect(0, 0, mW, mH);

    mCtx.translate(radarRadius, radarRadius);

    mCtx.fillStyle = '#1e293b';
    for (const r of this.world.roads) {
      const rx = (r.x - this.player.x) * scale;
      const ry = (r.y - this.player.y) * scale;
      mCtx.fillRect(rx, ry, r.w * scale, r.h * scale);
    }

    mCtx.fillStyle = '#14532d';
    const px = (this.world.park.x - this.player.x) * scale;
    const py = (this.world.park.y - this.player.y) * scale;
    mCtx.fillRect(px, py, this.world.park.w * scale, this.world.park.h * scale);

    for (const b of this.world.locations) {
      const bx = (b.x - this.player.x) * scale;
      const by = (b.y - this.player.y) * scale;
      mCtx.fillStyle = b.roofColor;
      mCtx.fillRect(bx, by, b.w * scale, b.h * scale);
    }

    // Xe máy
    if (!this.player.isRiding) {
      const vx = (this.motorcycle.x - this.player.x) * scale;
      const vy = (this.motorcycle.y - this.player.y) * scale;
      mCtx.fillStyle = '#f59e0b';
      mCtx.beginPath();
      mCtx.arc(vx, vy, 4, 0, Math.PI * 2);
      mCtx.fill();
    }

    // Điểm nhiệm vụ
    const q = this.quests.getCurrentQuest();
    if (q && q.type !== 'endless' && q.targetRadius > 0) {
      const qx = (q.targetX - this.player.x) * scale;
      const qy = (q.targetY - this.player.y) * scale;

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

    // Người chơi
    mCtx.fillStyle = '#38bdf8';
    mCtx.beginPath();
    mCtx.arc(0, 0, 4, 0, Math.PI * 2);
    mCtx.fill();
    mCtx.strokeStyle = '#ffffff';
    mCtx.lineWidth = 2;
    mCtx.stroke();

    mCtx.restore();

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
