/**
 * Quest System - Hệ thống nhiệm vụ cốt truyện Sinh viên Năm 4 & Shipper ShopeeFood
 */

class QuestManager {
  constructor(game) {
    this.game = game;
    this.step = 0;

    // Danh sách nhiệm vụ gắn liền với cuộc đời sinh viên năm 4
    this.quests = [
      {
        id: 'start_shift',
        title: 'Ca Chạy Tối Bắt Đầu',
        desc: 'Rời khỏi phòng trọ, đến gần chiếc xe máy ShopeeFood màu cam và nhấn [E] để lên xe.',
        targetTag: '📍 Mục tiêu: Xe máy ShopeeFood',
        targetX: 390,
        targetY: 440,
        targetRadius: 45,
        type: 'vehicle_mount'
      },
      {
        id: 'pickup_food_1',
        title: 'ShopeeFood: Nhận Đơn Cơm Tấm',
        desc: 'Điện thoại nổ đơn! Lái xe theo GPS đến Quán Cơm Tấm Đêm Sài Gòn để lấy suất cơm sườn.',
        targetTag: '📍 Mục tiêu: Quán Cơm Tấm Đêm',
        targetX: 2250,
        targetY: 400,
        targetRadius: 70,
        type: 'pickup'
      },
      {
        id: 'deliver_food_1',
        title: 'ShopeeFood: Giao Cơm Đêm',
        desc: 'Chạy xe giao hộp cơm nóng hổi đến Chung Cư Sakura cho bạn nữ sinh viên đang ôn thi khuya.',
        targetTag: '📍 Mục tiêu: Chung Cư Sakura',
        targetX: 340,
        targetY: 1220,
        targetRadius: 70,
        reward: 30000,
        type: 'deliver'
      },
      {
        id: 'university_thesis',
        title: 'Nộp Đồ Án Tốt Nghiệp Năm 4',
        desc: 'Lái xe đến Trường Đại Học Công Nghệ, gặp Thầy Hướng Dẫn ở cổng để nộp tiến độ đồ án tốt nghiệp.',
        targetTag: '📍 Mục tiêu: Cổng Trường Đại Học',
        targetX: 1190,
        targetY: 420,
        targetRadius: 70,
        type: 'story'
      },
      {
        id: 'pickup_boba',
        title: 'ShopeeFood: Đơn Trà Sữa Đêm',
        desc: 'Tiếng ting ting lại vang lên! Chạy xe đến Tiệm Trà Sữa Boba Cute lấy 2 ly boba trân châu.',
        targetTag: '📍 Mục tiêu: Tiệm Trà Sữa Boba',
        targetX: 2250,
        targetY: 1020,
        targetRadius: 70,
        type: 'pickup'
      },
      {
        id: 'deliver_boba',
        title: 'ShopeeFood: Giao Trà Sữa KTX',
        desc: 'Giao trà sữa đến Ký Túc Xá Sinh Viên cho nhóm bạn cùng khóa đang thức khuya làm bài tập lớn.',
        targetTag: '📍 Mục tiêu: Ký Túc Xá Đại Học',
        targetX: 2270,
        targetY: 1920,
        targetRadius: 70,
        reward: 35000,
        type: 'deliver'
      },
      {
        id: 'zen_park',
        title: 'Khoảnh Khắc Bình Yên & Chữa Lành',
        desc: 'Một ngày vất vả đã qua. Hãy chạy xe về Công Viên Hoa Anh Đào, đi bộ dưới hàng cây và vuốt ve bé Mèo Mướp.',
        targetTag: '📍 Mục tiêu: Bé Mèo ở Công Viên',
        targetX: 1100,
        targetY: 920,
        targetRadius: 60,
        type: 'heal'
      },
      {
        id: 'free_roam',
        title: 'Tự Do Dạo Phố & Thư Giãn',
        desc: 'Bạn đã hoàn thành xuất sắc một ngày tự lập! Giờ đây bạn có thể tự do lái xe ngắm phố phường, nghe nhạc lofi và chill.',
        targetTag: '📍 Tự do khám phá thành phố',
        targetX: 0,
        targetY: 0,
        targetRadius: 0,
        type: 'endless'
      }
    ];
  }

  getCurrentQuest() {
    return this.quests[Math.min(this.step, this.quests.length - 1)];
  }

  checkProgress(player, vehicle) {
    const q = this.getCurrentQuest();
    if (!q || q.type === 'endless') return;

    if (q.type === 'vehicle_mount') {
      if (player.isRiding) {
        this.nextQuest('Đã lên xe máy! Bắt đầu ca chạy ShopeeFood.');
      }
    }
  }

  // Tương tác tại điểm nhiệm vụ
  tryCompleteCurrentQuest(player) {
    const q = this.getCurrentQuest();
    if (!q || q.type === 'endless') return false;

    const dist = Math.hypot(player.x - q.targetX, player.y - q.targetY);
    if (dist <= q.targetRadius) {
      if (q.id === 'pickup_food_1') {
        window.soundEngine.playSparkle();
        this.nextQuest('Đã lấy suất Cơm Tấm Đêm thơm phức! Tiến hành giao cho khách.');
        return true;
      } else if (q.id === 'deliver_food_1') {
        player.money += q.reward;
        window.soundEngine.playCoin();
        this.game.showDialog(
          'Bạn Nữ Sinh Viên',
          '👧',
          '"Cảm ơn anh shipper nhiều lắm ạ! Em đang thức ôn thi môn cuối năm 4 mà đói lả người. Đêm hôm vất vả rồi, anh đi xe cẩn thận nhé!"'
        );
        this.nextQuest(`Giao hàng thành công! Nhận được ${q.reward.toLocaleString('vi-VN')} đ`);
        return true;
      } else if (q.id === 'university_thesis') {
        player.energy = 100;
        window.soundEngine.playSparkle();
        this.game.showDialog(
          'Thầy Hướng Dẫn Đồ Án',
          '👨‍🏫',
          '"Thầy xem qua tiến độ đồ án rồi, làm chỉn chu lắm Đăng! Thầy rất tự hào về em, vừa tự lập chạy ShopeeFood trang trải cuộc sống vừa giữ vững việc học. Người có ý chí như em chắc chắn sẽ gặt hái thành công lớn. Tự tin lên nhé!"'
        );
        this.nextQuest('Đồ án được duyệt xuất sắc! Tinh thần phục hồi 100%.');
        return true;
      } else if (q.id === 'pickup_boba') {
        window.soundEngine.playSparkle();
        this.nextQuest('Đã lấy 2 ly Trà Sữa Boba full trân châu! Mang tới Ký Túc Xá nào.');
        return true;
      } else if (q.id === 'deliver_boba') {
        player.money += q.reward;
        window.soundEngine.playCoin();
        this.game.showDialog(
          'Bạn Cùng Khóa KTX',
          '🎒',
          '"Uầy kịp lúc quá ông ơi! Bọn tui đang bí đề tài tốt nghiệp, có trà sữa vào là tỉnh táo ngay. Cảm ơn người anh em shipper siêu có tâm, tip thêm tiền trà đá nha!"'
        );
        this.nextQuest(`Giao trà sữa thành công! Nhận được ${q.reward.toLocaleString('vi-VN')} đ`);
        return true;
      } else if (q.id === 'zen_park') {
        player.triggerHeart();
        window.soundEngine.playMeow();
        this.game.showDialog(
          'Bé Mèo Công Viên & Lời Nhắn Nhủ',
          '🐱',
          '"Meow meow~ Hôm nay dù có chuyện làm bạn buồn, nhưng bạn hãy nhìn lại xem: bạn đang vừa nỗ lực học năm cuối vừa chăm chỉ lao động tự lập. Bạn đã rất kiên cường và mạnh mẽ rồi! Mọi bão giông sẽ qua đi, ngày mai sẽ là một ngày rực rỡ. Ngủ thật ngon nhé!"'
        );
        this.nextQuest('Tâm hồn đã được chữa lành! Bạn mở khóa chế độ Tự Do Khám Phá.');
        return true;
      }
    }
    return false;
  }

  nextQuest(toastMessage) {
    this.step++;
    const nextQ = this.getCurrentQuest();

    // Phát âm thanh nổ đơn hoặc chuông chúc mừng
    window.soundEngine.playNotification();

    // Hiện toast thông báo
    this.game.showToast(
      nextQ.type === 'pickup' ? 'NỔ ĐƠN SHOPEEFOOD MỚI! 🛵' : 'TIẾN ĐỘ NHIỆM VỤ ✨',
      toastMessage || nextQ.title
    );

    // Cập nhật giao diện Quest HUD
    document.getElementById('quest-title').innerText = nextQ.title;
    document.getElementById('quest-desc').innerText = nextQ.desc;
    document.getElementById('quest-target-tag').innerText = nextQ.targetTag;
  }
}

window.QuestManager = QuestManager;
