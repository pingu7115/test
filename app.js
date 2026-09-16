/**
 * 蕭宥瑄的暖色慢調時光 (Aesthetic Literary Time Hub)
 * Core Logic & Interactive Engine
 */

(function () {
  'use strict';

  // --- 預設值與文青雅趣狀態 ---
  const DEFAULT_PROFILE = {
    name: '蕭宥瑄',
    motto: '慢品人間煙火色，閒觀萬事歲月長'
  };

  const THEMES = {
    'warm-latte': '暖陽燕麥',
    'amber-twilight': '琥珀暮色',
    'matcha-tea': '京都茶室',
    'vintage-kraft': '復古暖紙',
    'warm-espresso': '靜夜深焙'
  };

  // 讀取既有主題，若為舊版主題則自動遷移至暖陽燕麥
  let storedTheme = localStorage.getItem('clockTheme');
  if (!storedTheme || !THEMES[storedTheme]) {
    storedTheme = 'warm-latte';
  }

  // 若座右銘為舊版預設，則升級為文青風座右銘
  let storedMotto = localStorage.getItem('userMotto');
  if (!storedMotto || storedMotto === '專注於當下，享受每一秒的精彩') {
    storedMotto = DEFAULT_PROFILE.motto;
  }

  let state = {
    is24Hour: localStorage.getItem('timeFormat') !== '12H',
    theme: storedTheme,
    name: localStorage.getItem('userName') || DEFAULT_PROFILE.name,
    motto: storedMotto,
    isZenMode: false,
    glowEffect: true
  };

  // --- DOM 元素快取 ---
  const elements = {
    // 時間
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    periodBadge: document.getElementById('periodBadge'),
    formatBadge: document.getElementById('formatBadge'),
    formatToggleBtn: document.getElementById('formatToggleBtn'),
    
    // 日期與曆法
    fullDateDisplay: document.getElementById('fullDateDisplay'),
    dayOfYearBadge: document.getElementById('dayOfYearBadge'),
    
    // 今日進度條
    dayProgressBar: document.getElementById('dayProgressBar'),
    dayProgressPercent: document.getElementById('dayProgressPercent'),
    dayProgressPassed: document.getElementById('dayProgressPassed'),
    dayProgressLeft: document.getElementById('dayProgressLeft'),
    
    // 問候與使用者資料
    greetingIcon: document.getElementById('greetingIcon'),
    greetingText: document.getElementById('greetingText'),
    userNameDisplay: document.getElementById('userNameDisplay'),
    avatarLetter: document.getElementById('avatarLetter'),
    userMotto: document.getElementById('userMotto'),
    
    // 主題選單
    themeMenuBtn: document.getElementById('themeMenuBtn'),
    themeDropdown: document.getElementById('themeDropdown'),
    currentThemeName: document.getElementById('currentThemeName'),
    themeOptions: document.querySelectorAll('.theme-option'),
    
    // 快捷按鈕與彈窗
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    fullscreenIcon: document.getElementById('fullscreenIcon'),
    copyTimeBtn: document.getElementById('copyTimeBtn'),
    toggleSecEffectBtn: document.getElementById('toggleSecEffectBtn'),
    zenModeBtn: document.getElementById('zenModeBtn'),
    editNameBtn: document.getElementById('editNameBtn'),
    nameModal: document.getElementById('nameModal'),
    nameForm: document.getElementById('nameForm'),
    nameInput: document.getElementById('nameInput'),
    mottoInput: document.getElementById('mottoInput'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
    toast: document.getElementById('toast'),
    mainCard: document.getElementById('mainCard')
  };

  // --- 初始化 Lucide 圖標 ---
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // --- 格式化輔助函數 ---
  function padZero(num) {
    return num.toString().padStart(2, '0');
  }

  // 計算一年中的第幾天
  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  // 根據時段產生文青溫潤問候語
  function getGreeting(hour) {
    if (hour >= 5 && hour < 9) {
      return { icon: '☕', text: '晨光熹微，山色初醒，美好正悄然發生' };
    } else if (hour >= 9 && hour < 12) {
      return { icon: '🌿', text: '清風拂面，字句生香，願今日心境明朗' };
    } else if (hour >= 12 && hour < 14) {
      return { icon: '🍱', text: '日正當中，茶香飯暖，慢享片刻悠然' };
    } else if (hour >= 14 && hour < 18) {
      return { icon: '📖', text: '午後斜陽，煮字烹茶，微風輕翻書頁' };
    } else if (hour >= 18 && hour < 22) {
      return { icon: '🌆', text: '暮靄向晚，晚霞溫柔，願歸途皆有微光' };
    } else {
      return { icon: '🌙', text: '夜色溫涼，星河長明，願你好夢常伴' };
    }
  }

  // --- 時間與界面更新引擎 ---
  function updateClock() {
    const now = new Date();
    const rawHours = now.getHours();
    const rawMinutes = now.getMinutes();
    const rawSeconds = now.getSeconds();

    // 12/24 小時制處理
    let displayHours = rawHours;
    let period = '';

    if (!state.is24Hour) {
      period = rawHours >= 12 ? 'PM' : 'AM';
      displayHours = rawHours % 12 || 12;
      elements.periodBadge.style.display = 'block';
      elements.periodBadge.textContent = period;
    } else {
      elements.periodBadge.style.display = 'none';
    }

    elements.hours.textContent = padZero(displayHours);
    elements.minutes.textContent = padZero(rawMinutes);
    elements.seconds.textContent = padZero(rawSeconds);

    // 更新日期與星期（以典雅宋體展示）
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayOfWeek = weekDays[now.getDay()];
    elements.fullDateDisplay.textContent = `${year}年${month}月${date}日 星期${dayOfWeek}`;

    // 更新一年中第幾天
    const dayOfYear = getDayOfYear(now);
    elements.dayOfYearBadge.textContent = `歲稔 第 ${dayOfYear} 天`;

    // 更新今日時間進度條 (0:00:00 ~ 23:59:59)
    const totalSecondsToday = (rawHours * 3600) + (rawMinutes * 60) + rawSeconds;
    const percent = ((totalSecondsToday / 86400) * 100).toFixed(1);
    elements.dayProgressBar.style.width = `${percent}%`;
    elements.dayProgressPercent.textContent = `${percent}%`;

    // 剩餘時間計算
    const passedHours = rawHours;
    const passedMinutes = rawMinutes;
    const leftHours = 23 - rawHours;
    const leftMinutes = 59 - rawMinutes;

    elements.dayProgressPassed.textContent = `已走過 ${passedHours} 小時 ${passedMinutes} 分鐘`;
    elements.dayProgressLeft.textContent = `餘裕 ${leftHours} 小時 ${leftMinutes} 分鐘`;

    // 更新問候語
    const greeting = getGreeting(rawHours);
    elements.greetingIcon.textContent = greeting.icon;
    elements.greetingText.textContent = `${state.name}，${greeting.text}`;
  }

  // --- 使用者 Profile 與展示更新 ---
  function applyProfile() {
    elements.userNameDisplay.textContent = state.name;
    elements.userMotto.textContent = state.motto;
    
    // 首字作為印章徽章
    const firstChar = state.name.trim().charAt(0) || '蕭';
    elements.avatarLetter.textContent = firstChar;

    // 同步更新網頁標題
    document.title = `${state.name}的暖色慢調時光 | Aesthetic Time Hub`;
  }

  // --- 主題切換邏輯 ---
  function applyTheme(themeKey) {
    if (!THEMES[themeKey]) themeKey = 'warm-latte';
    state.theme = themeKey;
    document.body.setAttribute('data-theme', themeKey);
    localStorage.setItem('clockTheme', themeKey);
    elements.currentThemeName.textContent = THEMES[themeKey];

    // 更新下拉選項選中狀態
    elements.themeOptions.forEach(opt => {
      if (opt.getAttribute('data-theme-id') === themeKey) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  // --- 顯示通知 Toast ---
  let toastTimer = null;
  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, 2500);
  }

  // --- 互動事件綁定 ---
  function setupEventListeners() {
    // 12/24 小時格式切換
    elements.formatToggleBtn.addEventListener('click', () => {
      state.is24Hour = !state.is24Hour;
      elements.formatBadge.textContent = state.is24Hour ? '24H' : '12H';
      localStorage.setItem('timeFormat', state.is24Hour ? '24H' : '12H');
      updateClock();
    });

    // 主題選單切換開關
    elements.themeMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.themeDropdown.classList.toggle('hidden');
    });

    // 點擊外部關閉主題選單
    document.addEventListener('click', (e) => {
      if (!elements.themeMenuBtn.contains(e.target) && !elements.themeDropdown.contains(e.target)) {
        elements.themeDropdown.classList.add('hidden');
      }
    });

    // 主題選擇事件
    elements.themeOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const themeId = opt.getAttribute('data-theme-id');
        applyTheme(themeId);
        elements.themeDropdown.classList.add('hidden');
      });
    });

    // 全螢幕切換
    elements.fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        elements.fullscreenIcon.setAttribute('data-lucide', 'minimize');
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
          elements.fullscreenIcon.setAttribute('data-lucide', 'maximize');
        }
      }
      refreshIcons();
    });

    document.addEventListener('fullscreenchange', () => {
      const isFull = !!document.fullscreenElement;
      elements.fullscreenIcon.setAttribute('data-lucide', isFull ? 'minimize' : 'maximize');
      refreshIcons();
    });

    // 複製時光戳記
    elements.copyTimeBtn.addEventListener('click', () => {
      const now = new Date();
      const timeStr = `${now.getFullYear()}/${padZero(now.getMonth() + 1)}/${padZero(now.getDate())} ${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;
      navigator.clipboard.writeText(timeStr).then(() => {
        showToast(`已留存當前時光戳記：${timeStr}`);
      }).catch(() => {
        showToast(`留存失敗，當前時刻：${timeStr}`);
      });
    });

    // 暖陽光暈特效開關
    elements.toggleSecEffectBtn.addEventListener('click', () => {
      state.glowEffect = !state.glowEffect;
      elements.toggleSecEffectBtn.classList.toggle('active', state.glowEffect);
      const orbs = document.querySelectorAll('.glow-orb');
      orbs.forEach(orb => {
        orb.style.display = state.glowEffect ? 'block' : 'none';
      });
      showToast(state.glowEffect ? '已開啟暖陽柔光' : '已沉澱背景光暈');
    });

    // 靜思專注模式 (Zen Mode)
    elements.zenModeBtn.addEventListener('click', () => {
      state.isZenMode = !state.isZenMode;
      document.body.classList.toggle('zen-active', state.isZenMode);
      elements.zenModeBtn.classList.toggle('active', state.isZenMode);
      elements.zenModeBtn.querySelector('span').textContent = state.isZenMode ? '退出靜思' : '靜思專注';
      showToast(state.isZenMode ? '已進入靜思專注空間' : '已恢復日常景致');
    });

    // 姓名與題字自訂 Modal
    function openModal() {
      elements.nameInput.value = state.name;
      elements.mottoInput.value = state.motto;
      elements.nameModal.classList.remove('hidden');
      elements.nameInput.focus();
    }

    function closeModal() {
      elements.nameModal.classList.add('hidden');
    }

    elements.editNameBtn.addEventListener('click', openModal);
    elements.closeModalBtn.addEventListener('click', closeModal);

    // 點擊遮罩外層關閉
    elements.nameModal.addEventListener('click', (e) => {
      if (e.target === elements.nameModal) {
        closeModal();
      }
    });

    // 表單提交儲存
    elements.nameForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = elements.nameInput.value.trim();
      const newMotto = elements.mottoInput.value.trim();

      if (newName) {
        state.name = newName;
        state.motto = newMotto || DEFAULT_PROFILE.motto;
        localStorage.setItem('userName', state.name);
        localStorage.setItem('userMotto', state.motto);
        applyProfile();
        updateClock();
        closeModal();
        showToast('雅號與題字已妥善典藏！');
      }
    });

    // 恢復預設值
    elements.resetDefaultsBtn.addEventListener('click', () => {
      elements.nameInput.value = DEFAULT_PROFILE.name;
      elements.mottoInput.value = DEFAULT_PROFILE.motto;
    });

    // ESC 鍵關閉彈窗與下拉選單
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        elements.themeDropdown.classList.add('hidden');
      }
    });
  }

  // --- 啟動初始化 ---
  function init() {
    elements.formatBadge.textContent = state.is24Hour ? '24H' : '12H';
    applyProfile();
    applyTheme(state.theme);
    refreshIcons();
    updateClock();

    // 每秒更新時鐘
    setInterval(updateClock, 1000);

    setupEventListeners();
  }

  // 待 DOM 載入後執行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
