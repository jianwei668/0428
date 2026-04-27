/*
 * 人才项目资料管理系统 - 静态演示版 V1.2 Final
 * 说明：本文件负责登录、角色权限、页面切换、CRUD、localStorage 持久化等前端交互。
 */
let currentUser = null;
let currentPage = "members";
let bookSearchKeyword = "";
let bookPage = 1;
let currentBookId = null;
let readingPlanPage = 1;
let trainingPage = 1;
let scheduleView = "month";
let scheduleCursor = new Date(2026, 3, 1);
let memberSearchKeyword = "";
let memberPage = 1;
const pageSize = 10;



function handleTopbarSearch(value) {
  const keyword = value.trim();
  if (!keyword) return;

  if (currentPage === "members") {
    memberSearchKeyword = keyword;
    renderMembersPage();
    return;
  }

  if (currentPage === "books") {
    bookSearchKeyword = keyword;
    renderBooksPage();
    return;
  }

  showToast("当前页面不支持快速搜索，请在成员管理或书目库中使用搜索框");
}

/* 本地数据持久化 */
const STORAGE_KEYS = {
  members: "talentSystem.members",
  schedules: "talentSystem.schedules",
  trainings: "talentSystem.trainings",
  books: "talentSystem.books",
  audioResources: "talentSystem.audioResources",
  readingPlans: "talentSystem.readingPlans"
};

const INITIAL_STATE = {
  members: JSON.parse(JSON.stringify(members)),
  schedules: JSON.parse(JSON.stringify(schedules)),
  trainings: JSON.parse(JSON.stringify(trainings)),
  books: JSON.parse(JSON.stringify(books)),
  audioResources: JSON.parse(JSON.stringify(audioResources)),
  readingPlans: JSON.parse(JSON.stringify(readingPlans))
};

function loadState() {
  try {
    const savedMembers = localStorage.getItem(STORAGE_KEYS.members);
    const savedSchedules = localStorage.getItem(STORAGE_KEYS.schedules);
    const savedTrainings = localStorage.getItem(STORAGE_KEYS.trainings);
    const savedBooks = localStorage.getItem(STORAGE_KEYS.books);
    const savedAudioResources = localStorage.getItem(STORAGE_KEYS.audioResources);
    const savedReadingPlans = localStorage.getItem(STORAGE_KEYS.readingPlans);

    if (savedMembers) members = JSON.parse(savedMembers);
    if (savedSchedules) schedules = JSON.parse(savedSchedules);
    if (savedTrainings) trainings = JSON.parse(savedTrainings);
    if (savedBooks) books = JSON.parse(savedBooks);
    if (savedAudioResources) audioResources = JSON.parse(savedAudioResources);
    if (savedReadingPlans) readingPlans = JSON.parse(savedReadingPlans);
  } catch (error) {
    console.warn("读取本地存储数据失败，已使用初始数据。", error);
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEYS.members, JSON.stringify(members));
  localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));
  localStorage.setItem(STORAGE_KEYS.trainings, JSON.stringify(trainings));
  localStorage.setItem(STORAGE_KEYS.books, JSON.stringify(books));
  localStorage.setItem(STORAGE_KEYS.audioResources, JSON.stringify(audioResources));
  localStorage.setItem(STORAGE_KEYS.readingPlans, JSON.stringify(readingPlans));
}

function resetDemoData() {
  const confirmed = confirm("确认重置所有演示数据吗？当前新增、编辑的数据会恢复到初始状态。");
  if (!confirmed) return;

  members = JSON.parse(JSON.stringify(INITIAL_STATE.members));
  schedules = JSON.parse(JSON.stringify(INITIAL_STATE.schedules));
  trainings = JSON.parse(JSON.stringify(INITIAL_STATE.trainings));
  books = JSON.parse(JSON.stringify(INITIAL_STATE.books));
  audioResources = JSON.parse(JSON.stringify(INITIAL_STATE.audioResources));
  readingPlans = JSON.parse(JSON.stringify(INITIAL_STATE.readingPlans));

  persistState();
  closeModal();
  currentBookId = null;
  showToast("演示数据已重置");
  switchPage(currentPage);
}

function toggleMobileMenu() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".mobile-overlay");
  const willOpen = !sidebar.classList.contains("mobile-open");
  sidebar.classList.toggle("mobile-open", willOpen);
  if (overlay) overlay.classList.toggle("active", willOpen);
}

function closeMobileMenu() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".mobile-overlay");
  if (sidebar) sidebar.classList.remove("mobile-open");
  if (overlay) overlay.classList.remove("active");
}



document.addEventListener("DOMContentLoaded", () => {
  loadState();
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
  }
});

function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const user = MOCK_USERS.find(item => item.username === username && item.password === password);

  if (!user) {
    showToast("账号或密码错误", "error");
    return;
  }

  currentUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role
  };

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  showToast("登录成功");
  showApp();
}

function showApp() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("appPage").classList.remove("hidden");

  document.getElementById("currentUserName").textContent = currentUser.name;
  document.getElementById("currentUserRole").textContent = currentUser.role === "admin" ? "管理员" : "普通成员";
  const sidebarUserName = document.getElementById("sidebarUserName");
  if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
  const avatarBadge = document.querySelector(".avatar-badge");
  if (avatarBadge) avatarBadge.textContent = currentUser.name ? currentUser.name.slice(0, 1) : "员";

  switchPage("members");
}

function logout() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  document.getElementById("appPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

function switchPage(page) {
  currentPage = page;
  if (page !== "books") {
    currentBookId = null;
  }
  closeMobileMenu();

  document.querySelectorAll(".menu-item").forEach(item => {
    item.classList.toggle("active", item.dataset.page === page);
  });

  const titleMap = {
    members: ["成员管理", "管理人才项目成员基础资料"],
    schedules: ["日程安排", "查看和维护个人 / 公共日程"],
    trainings: ["培训项目", "管理培训项目信息和参与成员"],
    books: ["书目库 / 听书", "维护书目库和听书资源"],
    readingPlans: ["读书计划", "维护个人读书计划、进度和心得"]
  };

  document.getElementById("pageTitle").textContent = titleMap[page][0];
  document.getElementById("pageSubtitle").textContent = titleMap[page][1];

  if (page === "members") {
    renderMembersPage();
  } else if (page === "schedules") {
    renderSchedulesPage();
  } else if (page === "trainings") {
    renderTrainingsPage();
  } else if (page === "books") {
    renderBooksPage();
  } else if (page === "readingPlans") {
    renderReadingPlansPage();
  } else {
    renderPlaceholderPage(page);
  }
}

function isAdmin() {
  return currentUser && currentUser.role === "admin";
}


function renderMetricsPanel() {
  const visibleSchedulesCount = getVisibleSchedules ? getVisibleSchedules().length : schedules.length;
  const visiblePlansCount = getVisibleReadingPlans ? getVisibleReadingPlans().length : readingPlans.length;

  return `
    <section class="metrics-grid">
      <article class="metric-card">
        <div class="metric-label">人才成员</div>
        <div class="metric-value">${members.length}</div>
        <div class="metric-note">当前已维护成员资料</div>
        <div class="mini-progress"><span style="width:${Math.min(100, members.length * 18)}%"></span></div>
      </article>
      <article class="metric-card">
        <div class="metric-label">近期日程</div>
        <div class="metric-value">${visibleSchedulesCount}</div>
        <div class="metric-note">本人可见范围内</div>
        <div class="mini-progress"><span style="width:${Math.min(100, visibleSchedulesCount * 18)}%"></span></div>
      </article>
      <article class="metric-card">
        <div class="metric-label">培训项目</div>
        <div class="metric-value">${trainings.length}</div>
        <div class="metric-note">当前已创建培训</div>
        <div class="mini-progress"><span style="width:${Math.min(100, trainings.length * 25)}%"></span></div>
      </article>
      <article class="metric-card">
        <div class="metric-label">读书计划</div>
        <div class="metric-value">${visiblePlansCount}</div>
        <div class="metric-note">含进度和心得记录</div>
        <div class="mini-progress"><span style="width:${Math.min(100, visiblePlansCount * 22)}%"></span></div>
      </article>
    </section>
  `;
}


/* 成员管理 */
function renderMembersPage() {
  const content = document.getElementById("content");
  const adminButton = isAdmin()
    ? `<button class="btn btn-primary" onclick="openMemberForm()">新增成员</button>`
    : "";

  content.innerHTML = `
    ${renderMetricsPanel()}
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">成员列表</h2>
        </div>
        <div class="toolbar">
          <input
            class="search-input"
            value="${escapeHtml(memberSearchKeyword)}"
            placeholder="按姓名搜索"
            oninput="handleMemberSearch(this.value)"
          />
          ${adminButton}
        </div>
      </div>
      <div id="membersTable"></div>
    </div>
  `;

  renderMembersTable();
}

function handleMemberSearch(value) {
  memberSearchKeyword = value.trim();
  memberPage = 1;
  renderMembersTable();
}

function getFilteredMembers() {
  if (!memberSearchKeyword) return members;
  return members.filter(item => item.name.includes(memberSearchKeyword));
}

function renderMembersTable() {
  const container = document.getElementById("membersTable");
  const filtered = getFilteredMembers();

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  if (memberPage > totalPages) memberPage = totalPages;

  const start = (memberPage - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

  const rows = pageData.map(member => {
    const adminActions = isAdmin()
      ? `
        <button class="btn btn-warning btn-sm" onclick="openMemberForm(${member.id})">编辑</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMember(${member.id})">删除</button>
      `
      : "";

    return `
      <tr>
        <td><span class="avatar">${escapeHtml(member.name.slice(0, 1))}</span></td>
        <td>${escapeHtml(member.name)}</td>
        <td>${escapeHtml(member.gender)}</td>
        <td>${escapeHtml(member.phone)}</td>
        <td>${escapeHtml(member.email)}</td>
        <td>
          <div class="action-group">
            <button class="btn btn-light btn-sm" onclick="viewMember(${member.id})">查看</button>
            ${adminActions}
          </div>
        </td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>头像</th>
            <th>姓名</th>
            <th>性别</th>
            <th>电话</th>
            <th>邮箱</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="6" style="text-align:center;color:#6b7280;">暂无数据</td></tr>`}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button class="btn btn-light btn-sm" onclick="changeMemberPage(-1)" ${memberPage === 1 ? "disabled" : ""}>上一页</button>
      <span class="page-info">第 ${memberPage} / ${totalPages} 页，共 ${filtered.length} 条</span>
      <button class="btn btn-light btn-sm" onclick="changeMemberPage(1)" ${memberPage === totalPages ? "disabled" : ""}>下一页</button>
    </div>
  `;
}

function changeMemberPage(delta) {
  const totalPages = Math.max(1, Math.ceil(getFilteredMembers().length / pageSize));
  memberPage = Math.min(totalPages, Math.max(1, memberPage + delta));
  renderMembersTable();
}

function viewMember(id) {
  const member = members.find(item => item.id === id);
  if (!member) return;

  openModal("成员详情", `
    <div class="detail-grid">
      <div class="detail-label">姓名</div><div class="detail-value">${escapeHtml(member.name)}</div>
      <div class="detail-label">性别</div><div class="detail-value">${escapeHtml(member.gender)}</div>
      <div class="detail-label">电话</div><div class="detail-value">${escapeHtml(member.phone)}</div>
      <div class="detail-label">邮箱</div><div class="detail-value">${escapeHtml(member.email)}</div>
      <div class="detail-label">校区</div><div class="detail-value">${escapeHtml(member.campus)}</div>
      <div class="detail-label">职务</div><div class="detail-value">${escapeHtml(member.position)}</div>
      <div class="detail-label">成员批次</div><div class="detail-value">${escapeHtml(member.batch)}</div>
      <div class="detail-label">照片</div><div class="detail-value">${member.photoName ? escapeHtml(member.photoName) : "未上传"}</div>
      <div class="detail-label">简历</div><div class="detail-value">${member.resumeName ? `<a href="javascript:void(0)">${escapeHtml(member.resumeName)}</a>` : "未上传"}</div>
      <div class="detail-label">简介</div><div class="detail-value">${escapeHtml(member.intro)}</div>
    </div>
  `);
}

function openMemberForm(id) {
  if (!isAdmin()) {
    showToast("普通成员无权操作", "error");
    return;
  }

  const isEdit = Boolean(id);
  const member = isEdit
    ? members.find(item => item.id === id)
    : {
      name: "",
      gender: "男",
      phone: "",
      email: "",
      campus: "总部",
      position: "",
      batch: "",
      intro: "",
      photoName: "",
      resumeName: ""
    };

  const campusOptions = CAMPUS_OPTIONS.map(item => {
    return `<option value="${item}" ${member.campus === item ? "selected" : ""}>${item}</option>`;
  }).join("");

  openModal(isEdit ? "编辑成员" : "新增成员", `
    <form onsubmit="saveMember(event, ${isEdit ? id : "null"})">
      <div class="form-grid">
        <div class="form-group">
          <label>姓名</label>
          <input class="form-control" name="name" required value="${escapeHtml(member.name)}" />
        </div>

        <div class="form-group">
          <label>性别</label>
          <select class="form-control" name="gender">
            <option value="男" ${member.gender === "男" ? "selected" : ""}>男</option>
            <option value="女" ${member.gender === "女" ? "selected" : ""}>女</option>
          </select>
        </div>

        <div class="form-group">
          <label>电话</label>
          <input class="form-control" name="phone" required value="${escapeHtml(member.phone)}" />
        </div>

        <div class="form-group">
          <label>邮箱</label>
          <input class="form-control" name="email" type="email" required value="${escapeHtml(member.email)}" />
        </div>

        <div class="form-group">
          <label>校区</label>
          <select class="form-control" name="campus" required>${campusOptions}</select>
        </div>

        <div class="form-group">
          <label>职务</label>
          <input class="form-control" name="position" required value="${escapeHtml(member.position)}" />
        </div>

        <div class="form-group">
          <label>人才项目成员批次</label>
          <input class="form-control" name="batch" required value="${escapeHtml(member.batch)}" />
        </div>

        <div class="form-group">
          <label>照片</label>
          <input class="form-control" name="photo" type="file" accept=".jpg,.jpeg,.png" onchange="previewMemberPhoto(this)" />
          <input type="hidden" name="oldPhotoName" value="${escapeHtml(member.photoName)}" />
          <div id="photoPreview" style="margin-top:8px;">${member.photoName ? `<span class="text-muted">当前：${escapeHtml(member.photoName)}</span>` : ""}</div>
        </div>

        <div class="form-group">
          <label>简历</label>
          <input class="form-control" name="resume" type="file" accept=".pdf" />
          <input type="hidden" name="oldResumeName" value="${escapeHtml(member.resumeName)}" />
        </div>

        <div class="form-group full">
          <label>简介</label>
          <textarea class="form-control" name="intro" required>${escapeHtml(member.intro)}</textarea>
        </div>
      </div>

      <div class="form-footer">
        <button type="button" class="btn btn-light" onclick="closeModal()">取消</button>
        <button type="submit" class="btn btn-primary">保存</button>
      </div>
    </form>
  `);
}

function previewMemberPhoto(input) {
  const preview = document.getElementById("photoPreview");
  if (!preview) return;
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showToast("照片文件不能超过 5MB", "error");
    input.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}" style="max-width:120px;max-height:120px;border-radius:8px;margin-top:6px;border:1px solid var(--line);" alt="照片预览" />`;
  };
  reader.readAsDataURL(file);
}

function saveMember(event, id) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const email = formData.get("email").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("邮箱格式不正确", "error");
    return;
  }

  const photoFile = formData.get("photo");
  const resumeFile = formData.get("resume");

  if (photoFile && photoFile.size > 5 * 1024 * 1024) {
    showToast("照片文件不能超过 5MB", "error");
    return;
  }
  if (resumeFile && resumeFile.size > 10 * 1024 * 1024) {
    showToast("简历文件不能超过 10MB", "error");
    return;
  }

  const data = {
    name: formData.get("name").trim(),
    gender: formData.get("gender"),
    phone: formData.get("phone").trim(),
    email,
    campus: formData.get("campus"),
    position: formData.get("position").trim(),
    batch: formData.get("batch").trim(),
    intro: formData.get("intro").trim(),
    photoName: photoFile && photoFile.name ? photoFile.name : formData.get("oldPhotoName"),
    resumeName: resumeFile && resumeFile.name ? resumeFile.name : formData.get("oldResumeName")
  };

  if (id) {
    const index = members.findIndex(item => item.id === id);
    if (index !== -1) {
      members[index] = { ...members[index], ...data };
    }
    showToast("成员信息已更新");
  } else {
    members.unshift({
      id: Date.now(),
      ...data
    });
    showToast("成员已新增");
  }

  persistState();
  closeModal();
  renderMembersPage();
}

function deleteMember(id) {
  if (!isAdmin()) {
    showToast("普通成员无权操作", "error");
    return;
  }

  const member = members.find(item => item.id === id);
  if (!member) return;

  const confirmed = confirm(`确认删除成员「${member.name}」吗？`);
  if (!confirmed) return;

  members = members.filter(item => item.id !== id);
  persistState();
  showToast("成员已删除");
  renderMembersTable();
}


/* 日程安排 */
function renderSchedulesPage() {
  const content = document.getElementById("content");

  content.innerHTML = `
    ${renderMetricsPanel()}
    <div class="schedule-layout">
      <div class="card calendar-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">日程日历</h2>
          </div>
          <div class="toolbar">
            <button class="btn btn-light btn-sm" onclick="moveScheduleCursor(-1)">上一${getScheduleUnitName()}</button>
            <strong>${getScheduleTitle()}</strong>
            <button class="btn btn-light btn-sm" onclick="moveScheduleCursor(1)">下一${getScheduleUnitName()}</button>
            <div class="view-tabs">
              <button class="view-tab ${scheduleView === "month" ? "active" : ""}" onclick="changeScheduleView('month')">月</button>
              <button class="view-tab ${scheduleView === "week" ? "active" : ""}" onclick="changeScheduleView('week')">周</button>
              <button class="view-tab ${scheduleView === "day" ? "active" : ""}" onclick="changeScheduleView('day')">日</button>
            </div>
            <button class="btn btn-primary" onclick="openScheduleForm()">添加日程</button>
          </div>
        </div>
        <div id="scheduleCalendar"></div>
      </div>

      <aside class="side-panel">
        <h3>近期日程</h3>
        <div id="scheduleSideList"></div>
      </aside>
    </div>
  `;

  renderScheduleCalendar();
  renderScheduleSideList();
}

function getVisibleSchedules() {
  if (isAdmin()) return schedules;
  return schedules.filter(item => item.type === "public" || item.creatorId === currentUser.id);
}

function canEditSchedule(schedule) {
  return isAdmin() || schedule.creatorId === currentUser.id;
}

function changeScheduleView(view) {
  scheduleView = view;
  renderSchedulesPage();
}

function moveScheduleCursor(delta) {
  const next = new Date(scheduleCursor);

  if (scheduleView === "month") {
    next.setMonth(next.getMonth() + delta);
  } else if (scheduleView === "week") {
    next.setDate(next.getDate() + delta * 7);
  } else {
    next.setDate(next.getDate() + delta);
  }

  scheduleCursor = next;
  renderSchedulesPage();
}

function getScheduleUnitName() {
  if (scheduleView === "month") return "月";
  if (scheduleView === "week") return "周";
  return "日";
}

function getScheduleTitle() {
  const year = scheduleCursor.getFullYear();
  const month = scheduleCursor.getMonth() + 1;

  if (scheduleView === "month") {
    return `${year}年${month}月`;
  }

  if (scheduleView === "week") {
    const start = getWeekStart(scheduleCursor);
    const end = addDays(start, 6);
    return `${formatDate(start)} 至 ${formatDate(end)}`;
  }

  return formatDate(scheduleCursor);
}

function renderScheduleCalendar() {
  if (scheduleView === "month") {
    renderMonthView();
  } else if (scheduleView === "week") {
    renderWeekView();
  } else {
    renderDayView();
  }
}

function renderMonthView() {
  const container = document.getElementById("scheduleCalendar");
  const year = scheduleCursor.getFullYear();
  const month = scheduleCursor.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDate = getCalendarStartDate(firstDay);
  const cells = [];
  const weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  weekdays.forEach(day => {
    cells.push(`<div class="weekday-cell">${day}</div>`);
  });

  for (let i = 0; i < 42; i++) {
    const date = addDays(startDate, i);
    const dateKey = toDateKey(date);
    const daySchedules = getSchedulesByDate(dateKey);
    const isCurrentMonth = date.getMonth() === month;
    const isToday = dateKey === toDateKey(new Date());

    cells.push(`
      <div class="day-cell ${isCurrentMonth ? "" : "muted"}">
        <div class="day-number ${isToday ? "today" : ""}">${date.getDate()}</div>
        ${daySchedules.map(item => renderSchedulePill(item)).join("")}
      </div>
    `);
  }

  container.innerHTML = `<div class="month-grid">${cells.join("")}</div>`;
}

function renderWeekView() {
  const container = document.getElementById("scheduleCalendar");
  const start = getWeekStart(scheduleCursor);
  const weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  const rows = weekdays.map((day, index) => {
    const date = addDays(start, index);
    const dateKey = toDateKey(date);
    const items = getSchedulesByDate(dateKey);

    return `
      <div class="schedule-item">
        <div class="schedule-item-title">${day} · ${formatDate(date)}</div>
        ${items.length
          ? `<div class="schedule-list">${items.map(item => renderScheduleListItem(item)).join("")}</div>`
          : `<div class="empty-tip">暂无日程</div>`
        }
      </div>
    `;
  }).join("");

  container.innerHTML = `<div class="modal-body"><div class="schedule-list">${rows}</div></div>`;
}

function renderDayView() {
  const container = document.getElementById("scheduleCalendar");
  const dateKey = toDateKey(scheduleCursor);
  const items = getSchedulesByDate(dateKey);

  container.innerHTML = `
    <div class="modal-body">
      ${items.length
        ? `<div class="schedule-list">${items.map(item => renderScheduleListItem(item)).join("")}</div>`
        : `<div class="empty-tip">当天暂无日程</div>`
      }
    </div>
  `;
}

function renderSchedulePill(schedule) {
  return `
    <button class="schedule-pill ${schedule.type === "personal" ? "personal" : ""}" onclick="viewSchedule(${schedule.id})">
      ${formatTime(schedule.startTime)} ${escapeHtml(schedule.title)}
    </button>
  `;
}

function renderScheduleListItem(schedule) {
  const typeText = schedule.type === "public" ? "公共" : "个人";
  return `
    <div class="schedule-item">
      <div class="schedule-item-title">
        ${escapeHtml(schedule.title)}
        <span class="schedule-tag ${schedule.type === "personal" ? "personal" : ""}">${typeText}</span>
      </div>
      <div class="schedule-item-meta">
        ${formatDateTime(schedule.startTime)} - ${formatDateTime(schedule.endTime)}<br />
        创建人：${escapeHtml(schedule.creatorName)}
      </div>
      <div class="action-group" style="margin-top:10px;">
        <button class="btn btn-light btn-sm" onclick="viewSchedule(${schedule.id})">查看</button>
        ${canEditSchedule(schedule) ? `
          <button class="btn btn-warning btn-sm" onclick="openScheduleForm(${schedule.id})">编辑</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSchedule(${schedule.id})">删除</button>
        ` : ""}
      </div>
    </div>
  `;
}

function renderScheduleSideList() {
  const container = document.getElementById("scheduleSideList");
  const visible = getVisibleSchedules()
    .slice()
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 5);

  if (!visible.length) {
    container.innerHTML = `<div class="empty-tip">暂无近期日程</div>`;
    return;
  }

  container.innerHTML = `<div class="schedule-list">${visible.map(item => renderScheduleListItem(item)).join("")}</div>`;
}

function getSchedulesByDate(dateKey) {
  return getVisibleSchedules()
    .filter(item => item.startTime.slice(0, 10) === dateKey)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

function viewSchedule(id) {
  const schedule = schedules.find(item => item.id === id);
  if (!schedule) return;

  const typeText = schedule.type === "public" ? "公共日程" : "个人日程";
  const actionHtml = canEditSchedule(schedule)
    ? `
      <div class="form-footer">
        <button class="btn btn-warning" onclick="openScheduleForm(${schedule.id})">编辑</button>
        <button class="btn btn-danger" onclick="deleteSchedule(${schedule.id})">删除</button>
      </div>
    `
    : "";

  openModal("日程详情", `
    <div class="detail-grid">
      <div class="detail-label">标题</div><div class="detail-value">${escapeHtml(schedule.title)}</div>
      <div class="detail-label">类型</div><div class="detail-value">${typeText}</div>
      <div class="detail-label">开始时间</div><div class="detail-value">${formatDateTime(schedule.startTime)}</div>
      <div class="detail-label">结束时间</div><div class="detail-value">${formatDateTime(schedule.endTime)}</div>
      <div class="detail-label">创建人</div><div class="detail-value">${escapeHtml(schedule.creatorName)}</div>
      <div class="detail-label">描述</div><div class="detail-value">${escapeHtml(schedule.description || "无")}</div>
    </div>
    ${actionHtml}
  `);
}

function openScheduleForm(id) {
  const isEdit = Boolean(id);
  const schedule = isEdit
    ? schedules.find(item => item.id === id)
    : {
      title: "",
      type: isAdmin() ? "public" : "personal",
      startTime: "",
      endTime: "",
      description: ""
    };

  if (!schedule) return;

  if (isEdit && !canEditSchedule(schedule)) {
    showToast("你没有权限编辑该日程", "error");
    return;
  }

  const typeOptions = isAdmin()
    ? `
      <option value="public" ${schedule.type === "public" ? "selected" : ""}>公共</option>
      <option value="personal" ${schedule.type === "personal" ? "selected" : ""}>个人</option>
    `
    : `<option value="personal">个人</option>`;

  openModal(isEdit ? "编辑日程" : "添加日程", `
    <form onsubmit="saveSchedule(event, ${isEdit ? id : "null"})">
      <div class="form-grid">
        <div class="form-group full">
          <label>标题</label>
          <input class="form-control" name="title" required value="${escapeHtml(schedule.title)}" />
        </div>

        <div class="form-group">
          <label>开始时间</label>
          <input class="form-control" name="startTime" type="datetime-local" required value="${escapeHtml(schedule.startTime)}" />
        </div>

        <div class="form-group">
          <label>结束时间</label>
          <input class="form-control" name="endTime" type="datetime-local" required value="${escapeHtml(schedule.endTime)}" />
        </div>

        <div class="form-group">
          <label>类型</label>
          <select class="form-control" name="type">${typeOptions}</select>
        </div>

        <div class="form-group full">
          <label>描述</label>
          <textarea class="form-control" name="description">${escapeHtml(schedule.description || "")}</textarea>
        </div>
      </div>

      <div class="form-footer">
        <button type="button" class="btn btn-light" onclick="closeModal()">取消</button>
        <button type="submit" class="btn btn-primary">保存</button>
      </div>
    </form>
  `);
}

function saveSchedule(event, id) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");

  if (new Date(endTime) <= new Date(startTime)) {
    showToast("结束时间必须晚于开始时间", "error");
    return;
  }

  const type = isAdmin() ? formData.get("type") : "personal";

  const data = {
    title: formData.get("title").trim(),
    type,
    startTime,
    endTime,
    description: formData.get("description").trim()
  };

  if (id) {
    const index = schedules.findIndex(item => item.id === id);
    if (index !== -1) {
      if (!canEditSchedule(schedules[index])) {
        showToast("你没有权限编辑该日程", "error");
        return;
      }
      schedules[index] = { ...schedules[index], ...data };
    }
    showToast("日程已更新");
  } else {
    schedules.unshift({
      id: Date.now(),
      ...data,
      creatorId: currentUser.id,
      creatorName: currentUser.name
    });
    showToast("日程已添加");
  }

  scheduleCursor = new Date(startTime);
  persistState();
  closeModal();
  renderSchedulesPage();
}

function deleteSchedule(id) {
  const schedule = schedules.find(item => item.id === id);
  if (!schedule) return;

  if (!canEditSchedule(schedule)) {
    showToast("你没有权限删除该日程", "error");
    return;
  }

  const confirmed = confirm(`确认删除日程「${schedule.title}」吗？`);
  if (!confirmed) return;

  schedules = schedules.filter(item => item.id !== id);
  persistState();
  closeModal();
  showToast("日程已删除");
  renderSchedulesPage();
}

function getCalendarStartDate(firstDay) {
  const day = firstDay.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(firstDay, diff);
}

function getWeekStart(date) {
  const current = new Date(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(current, diff);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  const value = typeof date === "string" ? new Date(date) : date;
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function formatTime(value) {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDateTime(value) {
  return `${formatDate(value)} ${formatTime(value)}`;
}



/* 培训项目 */
function renderTrainingsPage() {
  const content = document.getElementById("content");
  const adminButton = isAdmin()
    ? `<button class="btn btn-primary" onclick="openTrainingForm()">新增培训</button>`
    : "";

  content.innerHTML = `
    ${renderMetricsPanel()}
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">培训项目列表</h2>
        </div>
        <div class="toolbar">
          ${adminButton}
        </div>
      </div>
      <div id="trainingsTable"></div>
    </div>
  `;

  trainingPage = 1;
  renderTrainingsTable();
}

function renderTrainingsTable() {
  const container = document.getElementById("trainingsTable");

  const totalPages = Math.max(1, Math.ceil(trainings.length / pageSize));
  if (trainingPage > totalPages) trainingPage = totalPages;
  const start = (trainingPage - 1) * pageSize;
  const pageData = trainings.slice(start, start + pageSize);

  const rows = pageData.map(training => {
    const participantCount = training.participantIds.length;
    const adminActions = isAdmin()
      ? `
        <button class="btn btn-warning btn-sm" onclick="openTrainingForm(${training.id})">编辑</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTraining(${training.id})">删除</button>
      `
      : "";

    return `
      <tr>
        <td>${escapeHtml(training.name)}</td>
        <td>${formatDateTime(training.startTime)}</td>
        <td>${formatDateTime(training.endTime)}</td>
        <td>${escapeHtml(training.location || "未填写")}</td>
        <td>
          <button class="btn btn-light btn-sm" onclick="showTrainingParticipants(${training.id})">
            ${participantCount} 人
          </button>
        </td>
        <td>${training.attachmentName ? `<span class="file-name">${escapeHtml(training.attachmentName)}</span>` : `<span class="text-muted">无</span>`}</td>
        <td>
          <div class="action-group">
            <button class="btn btn-light btn-sm" onclick="viewTraining(${training.id})">查看</button>
            ${adminActions}
          </div>
        </td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>项目名称</th>
            <th>开始时间</th>
            <th>结束时间</th>
            <th>地点</th>
            <th>参与人数</th>
            <th>材料附件</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="7" style="text-align:center;color:#6b7280;">暂无数据</td></tr>`}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button class="btn btn-light btn-sm" onclick="changeTrainingPage(-1)" ${trainingPage === 1 ? "disabled" : ""}>上一页</button>
      <span class="page-info">第 ${trainingPage} / ${totalPages} 页，共 ${trainings.length} 条</span>
      <button class="btn btn-light btn-sm" onclick="changeTrainingPage(1)" ${trainingPage === totalPages ? "disabled" : ""}>下一页</button>
    </div>
  `;
}

function changeTrainingPage(delta) {
  const totalPages = Math.max(1, Math.ceil(trainings.length / pageSize));
  trainingPage = Math.min(totalPages, Math.max(1, trainingPage + delta));
  renderTrainingsTable();
}

function getTrainingParticipants(training) {
  return training.participantIds
    .map(id => members.find(member => member.id === id))
    .filter(Boolean);
}

function showTrainingParticipants(id) {
  const training = trainings.find(item => item.id === id);
  if (!training) return;

  const participants = getTrainingParticipants(training);

  openModal("参与成员", `
    ${participants.length
      ? `<div class="participant-list">
          ${participants.map(member => `
            <div class="participant-item">
              <strong>${escapeHtml(member.name)}</strong>
              <div class="text-muted">${escapeHtml(member.campus)} · ${escapeHtml(member.position)} · ${escapeHtml(member.phone)}</div>
            </div>
          `).join("")}
        </div>`
      : `<div class="empty-tip">暂无参与成员</div>`
    }
  `);
}

function viewTraining(id) {
  const training = trainings.find(item => item.id === id);
  if (!training) return;

  const participants = getTrainingParticipants(training).map(item => item.name).join("、") || "暂无";

  const actionHtml = isAdmin()
    ? `
      <div class="form-footer">
        <button class="btn btn-warning" onclick="openTrainingForm(${training.id})">编辑</button>
        <button class="btn btn-danger" onclick="deleteTraining(${training.id})">删除</button>
      </div>
    `
    : "";

  openModal("培训项目详情", `
    <div class="detail-grid">
      <div class="detail-label">项目名称</div><div class="detail-value">${escapeHtml(training.name)}</div>
      <div class="detail-label">开始时间</div><div class="detail-value">${formatDateTime(training.startTime)}</div>
      <div class="detail-label">结束时间</div><div class="detail-value">${formatDateTime(training.endTime)}</div>
      <div class="detail-label">地点</div><div class="detail-value">${escapeHtml(training.location || "未填写")}</div>
      <div class="detail-label">参与成员</div><div class="detail-value">${escapeHtml(participants)}</div>
      <div class="detail-label">材料附件</div><div class="detail-value">${training.attachmentName ? escapeHtml(training.attachmentName) : "无"}</div>
      <div class="detail-label">描述</div><div class="detail-value">${escapeHtml(training.description || "无")}</div>
    </div>
    ${actionHtml}
  `);
}

function openTrainingForm(id) {
  if (!isAdmin()) {
    showToast("普通成员无权操作", "error");
    return;
  }

  const isEdit = Boolean(id);
  const training = isEdit
    ? trainings.find(item => item.id === id)
    : {
      name: "",
      startTime: "",
      endTime: "",
      location: "",
      description: "",
      participantIds: [],
      attachmentName: ""
    };

  if (!training) return;

  const memberChecks = members.map(member => {
    const checked = training.participantIds.includes(member.id) ? "checked" : "";
    return `
      <label class="member-check-item">
        <input type="checkbox" name="participantIds" value="${member.id}" ${checked} />
        <span>${escapeHtml(member.name)}（${escapeHtml(member.campus)} / ${escapeHtml(member.position)}）</span>
      </label>
    `;
  }).join("");

  openModal(isEdit ? "编辑培训项目" : "新增培训项目", `
    <form onsubmit="saveTraining(event, ${isEdit ? id : "null"})">
      <div class="form-grid">
        <div class="form-group full">
          <label>项目名称</label>
          <input class="form-control" name="name" required value="${escapeHtml(training.name)}" />
        </div>

        <div class="form-group">
          <label>开始时间</label>
          <input class="form-control" name="startTime" type="datetime-local" required value="${escapeHtml(training.startTime)}" />
        </div>

        <div class="form-group">
          <label>结束时间</label>
          <input class="form-control" name="endTime" type="datetime-local" required value="${escapeHtml(training.endTime)}" />
        </div>

        <div class="form-group full">
          <label>地点</label>
          <input class="form-control" name="location" value="${escapeHtml(training.location || "")}" />
        </div>

        <div class="form-group full">
          <label>参与成员</label>
          <div class="member-check-list">
            ${memberChecks || `<div class="text-muted">暂无成员数据</div>`}
          </div>
        </div>

        <div class="form-group full">
          <label>材料附件</label>
          <input class="form-control" name="attachment" type="file" accept=".pdf,.doc,.docx" />
          <input type="hidden" name="oldAttachmentName" value="${escapeHtml(training.attachmentName || "")}" />
          <div class="text-muted" style="margin-top:6px;">支持 pdf、word 格式</div>
        </div>

        <div class="form-group full">
          <label>描述</label>
          <textarea class="form-control" name="description">${escapeHtml(training.description || "")}</textarea>
        </div>
      </div>

      <div class="form-footer">
        <button type="button" class="btn btn-light" onclick="closeModal()">取消</button>
        <button type="submit" class="btn btn-primary">保存</button>
      </div>
    </form>
  `);
}

function saveTraining(event, id) {
  event.preventDefault();

  if (!isAdmin()) {
    showToast("普通成员无权操作", "error");
    return;
  }

  const form = event.target;
  const formData = new FormData(form);

  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");

  if (new Date(endTime) <= new Date(startTime)) {
    showToast("结束时间必须晚于开始时间", "error");
    return;
  }

  const attachmentFile = formData.get("attachment");
  const participantIds = formData.getAll("participantIds").map(value => Number(value));

  const data = {
    name: formData.get("name").trim(),
    startTime,
    endTime,
    location: formData.get("location").trim(),
    description: formData.get("description").trim(),
    participantIds,
    attachmentName: attachmentFile && attachmentFile.name ? attachmentFile.name : formData.get("oldAttachmentName")
  };

  if (id) {
    const index = trainings.findIndex(item => item.id === id);
    if (index !== -1) {
      trainings[index] = { ...trainings[index], ...data };
    }
    showToast("培训项目已更新");
  } else {
    trainings.unshift({
      id: Date.now(),
      ...data
    });
    showToast("培训项目已新增");
  }

  persistState();
  closeModal();
  renderTrainingsPage();
}

function deleteTraining(id) {
  if (!isAdmin()) {
    showToast("普通成员无权操作", "error");
    return;
  }

  const training = trainings.find(item => item.id === id);
  if (!training) return;

  const confirmed = confirm(`确认删除培训项目「${training.name}」吗？`);
  if (!confirmed) return;

  trainings = trainings.filter(item => item.id !== id);
  persistState();
  closeModal();
  showToast("培训项目已删除");
  renderTrainingsPage();
}



/* 书目库与听书资源 */
function renderBooksPage() {
  currentBookId = null;
  const content = document.getElementById("content");
  const adminButton = isAdmin()
    ? `<button class="btn btn-primary" onclick="openBookForm()">新增书目</button>`
    : "";

  content.innerHTML = `
    ${renderMetricsPanel()}
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">书目库</h2>
        </div>
        <div class="toolbar">
          <input
            class="search-input"
            value="${escapeHtml(bookSearchKeyword)}"
            placeholder="按书名 / 作者搜索"
            oninput="handleBookSearch(this.value)"
          />
          ${adminButton}
        </div>
      </div>
      <div id="booksTable"></div>
    </div>
  `;

  renderBooksTable();
}

function handleBookSearch(value) {
  bookSearchKeyword = value.trim();
  bookPage = 1;
  renderBooksTable();
}

function getFilteredBooks() {
  if (!bookSearchKeyword) return books;
  return books.filter(book => {
    return book.title.includes(bookSearchKeyword) || book.author.includes(bookSearchKeyword);
  });
}

function renderBooksTable() {
  const container = document.getElementById("booksTable");
  const filtered = getFilteredBooks();

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  if (bookPage > totalPages) bookPage = totalPages;

  const start = (bookPage - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

  const rows = pageData.map(book => {
    const adminActions = isAdmin()
      ? `
        <button class="btn btn-warning btn-sm" onclick="openBookForm(${book.id})">编辑</button>
        <button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id})">删除</button>
      `
      : "";

    return `
      <tr>
        <td><span class="book-cover">${escapeHtml(book.title.slice(0, 1))}</span></td>
        <td><a class="book-link" onclick="viewBookDetail(${book.id})">${escapeHtml(book.title)}</a></td>
        <td>${escapeHtml(book.author)}</td>
        <td>${escapeHtml(book.isbn || "未填写")}</td>
        <td><span class="book-category">${escapeHtml(book.category || "未分类")}</span></td>
        <td>
          <div class="action-group">
            <button class="btn btn-light btn-sm" onclick="viewBookDetail(${book.id})">查看</button>
            ${adminActions}
          </div>
        </td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>封面</th>
            <th>书名</th>
            <th>作者</th>
            <th>ISBN</th>
            <th>分类</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="6" style="text-align:center;color:#6b7280;">暂无数据</td></tr>`}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button class="btn btn-light btn-sm" onclick="changeBookPage(-1)" ${bookPage === 1 ? "disabled" : ""}>上一页</button>
      <span class="page-info">第 ${bookPage} / ${totalPages} 页，共 ${filtered.length} 条</span>
      <button class="btn btn-light btn-sm" onclick="changeBookPage(1)" ${bookPage === totalPages ? "disabled" : ""}>下一页</button>
    </div>
  `;
}

function changeBookPage(delta) {
  const totalPages = Math.max(1, Math.ceil(getFilteredBooks().length / pageSize));
  bookPage = Math.min(totalPages, Math.max(1, bookPage + delta));
  renderBooksTable();
}

function openBookForm(id) {
  if (!isAdmin()) {
    showToast("普通成员无权操作", "error");
    return;
  }

  const isEdit = Boolean(id);
  const book = isEdit
    ? books.find(item => item.id === id)
    : {
      title: "",
      author: "",
      isbn: "",
      category: "技术",
      coverName: "",
      intro: ""
    };

  if (!book) return;

  openModal(isEdit ? "编辑书目" : "新增书目", `
    <form onsubmit="saveBook(event, ${isEdit ? id : "null"})">
      <div class="form-grid">
        <div class="form-group">
          <label>书名</label>
          <input class="form-control" name="title" required value="${escapeHtml(book.title)}" />
        </div>

        <div class="form-group">
          <label>作者</label>
          <input class="form-control" name="author" required value="${escapeHtml(book.author)}" />
        </div>

        <div class="form-group">
          <label>ISBN</label>
          <input class="form-control" name="isbn" value="${escapeHtml(book.isbn || "")}" />
        </div>

        <div class="form-group">
          <label>分类</label>
          <select class="form-control" name="category">
            <option value="技术" ${book.category === "技术" ? "selected" : ""}>技术</option>
            <option value="管理" ${book.category === "管理" ? "selected" : ""}>管理</option>
            <option value="人文" ${book.category === "人文" ? "selected" : ""}>人文</option>
          </select>
        </div>

        <div class="form-group full">
          <label>封面图片</label>
          <input class="form-control" name="cover" type="file" accept=".jpg,.jpeg,.png" />
          <input type="hidden" name="oldCoverName" value="${escapeHtml(book.coverName || "")}" />
          <div class="text-muted" style="margin-top:6px;">支持 jpg / png 格式</div>
        </div>

        <div class="form-group full">
          <label>内容简介</label>
          <textarea class="form-control" name="intro">${escapeHtml(book.intro || "")}</textarea>
        </div>
      </div>

      <div class="form-footer">
        <button type="button" class="btn btn-light" onclick="closeModal()">取消</button>
        <button type="submit" class="btn btn-primary">保存</button>
      </div>
    </form>
  `);
}

function saveBook(event, id) {
  event.preventDefault();

  if (!isAdmin()) {
    showToast("普通成员无权操作", "error");
    return;
  }

  const form = event.target;
  const formData = new FormData(form);
  const coverFile = formData.get("cover");

  const data = {
    title: formData.get("title").trim(),
    author: formData.get("author").trim(),
    isbn: formData.get("isbn").trim(),
    category: formData.get("category"),
    coverName: coverFile && coverFile.name ? coverFile.name : formData.get("oldCoverName"),
    intro: formData.get("intro").trim()
  };

  if (id) {
    const index = books.findIndex(item => item.id === id);
    if (index !== -1) {
      books[index] = { ...books[index], ...data };
    }
    showToast("书目信息已更新");
  } else {
    books.unshift({
      id: Date.now(),
      ...data
    });
    showToast("书目已新增");
  }

  persistState();
  closeModal();

  if (currentBookId) {
    viewBookDetail(currentBookId);
  } else {
    renderBooksPage();
  }
}

function deleteBook(id) {
  if (!isAdmin()) {
    showToast("普通成员无权操作", "error");
    return;
  }

  const book = books.find(item => item.id === id);
  if (!book) return;

  const confirmed = confirm(`确认删除书目「${book.title}」吗？相关听书资源也会从静态数据中移除。`);
  if (!confirmed) return;

  books = books.filter(item => item.id !== id);
  audioResources = audioResources.filter(item => item.bookId !== id);
  currentBookId = null;
  persistState();
  closeModal();
  showToast("书目已删除");
  renderBooksPage();
}

function viewBookDetail(id) {
  const book = books.find(item => item.id === id);
  if (!book) return;

  currentBookId = id;

  document.getElementById("pageTitle").textContent = "书目详情";
  document.getElementById("pageSubtitle").textContent = "查看书目信息和关联听书资源";

  const adminActions = isAdmin()
    ? `
      <div class="action-group">
        <button class="btn btn-warning" onclick="openBookForm(${book.id})">编辑书目</button>
        <button class="btn btn-danger" onclick="deleteBook(${book.id})">删除书目</button>
      </div>
    `
    : "";

  const uploadAudioButton = isAdmin()
    ? `<button class="btn btn-primary" onclick="openAudioForm(${book.id})">上传音频</button>`
    : "";

  document.getElementById("content").innerHTML = `
    <button class="back-btn" onclick="switchPage('books')"><svg style="width:14px;height:14px" viewBox="0 0 256 256" fill="currentColor"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/></svg> 返回书目库</button>

    <div class="card">
      <div class="modal-body">
        <div class="book-detail">
          <div class="book-detail-cover">${escapeHtml(book.title.slice(0, 1))}</div>
          <div class="book-detail-info">
            <h2>${escapeHtml(book.title)}</h2>
            <div class="book-meta">
              作者：${escapeHtml(book.author)}<br />
              ISBN：${escapeHtml(book.isbn || "未填写")}<br />
              分类：<span class="book-category">${escapeHtml(book.category || "未分类")}</span><br />
              封面文件：${book.coverName ? escapeHtml(book.coverName) : "未上传"}
            </div>
            <div class="book-intro">${escapeHtml(book.intro || "暂无简介")}</div>
            <div style="margin-top:16px;">${adminActions}</div>
          </div>
        </div>

        <hr class="section-divider" />

        <div class="card-header" style="padding:0 0 16px;border-bottom:0;">
          <div>
            <h2 class="card-title">听书资源</h2>
            <p class="text-muted" style="margin:6px 0 0;">支持上传多个音频资源，如按章节分段上传。</p>
          </div>
          <div class="toolbar">${uploadAudioButton}</div>
        </div>

        <div id="audioList"></div>
      </div>
    </div>
  `;

  renderAudioList(book.id);
}

function renderAudioList(bookId) {
  const container = document.getElementById("audioList");
  const list = audioResources.filter(item => item.bookId === bookId);

  if (!list.length) {
    container.innerHTML = `<div class="empty-tip">暂无听书资源</div>`;
    return;
  }

  container.innerHTML = `
    <div class="audio-list">
      ${list.map(audio => `
        <div class="audio-item">
          <div class="audio-title">${escapeHtml(audio.title)}</div>
          <div class="audio-meta">
            文件：${escapeHtml(audio.fileName)}　|　
            时长：${escapeHtml(audio.duration || "未知")}　|　
            上传时间：${escapeHtml(audio.uploadedAt)}
          </div>
          <audio class="audio-player" controls>
            <source src="" type="audio/mpeg" />
            当前浏览器不支持音频播放。
          </audio>
          <div class="action-group" style="margin-top:10px;">
            ${isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="deleteAudio(${audio.id})">删除</button>` : ""}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function openAudioForm(bookId) {
  if (!isAdmin()) {
    showToast("普通成员无权操作", "error");
    return;
  }

  const book = books.find(item => item.id === bookId);
  if (!book) return;

  openModal("上传听书资源", `
    <form onsubmit="saveAudio(event, ${bookId})">
      <div class="form-grid">
        <div class="form-group full">
          <label>关联书目</label>
          <input class="form-control" value="${escapeHtml(book.title)}" disabled />
        </div>

        <div class="form-group full">
          <label>音频标题</label>
          <input class="form-control" name="title" placeholder="可选，不填则使用文件名" />
        </div>

        <div class="form-group">
          <label>音频时长</label>
          <input class="form-control" name="duration" placeholder="例如 12:30" />
        </div>

        <div class="form-group">
          <label>音频文件</label>
          <input class="form-control" name="audioFile" type="file" accept=".mp3" required />
        </div>
      </div>

      <div class="form-footer">
        <button type="button" class="btn btn-light" onclick="closeModal()">取消</button>
        <button type="submit" class="btn btn-primary">上传</button>
      </div>
    </form>
  `);
}

function saveAudio(event, bookId) {
  event.preventDefault();

  if (!isAdmin()) {
    showToast("普通成员无权操作", "error");
    return;
  }

  const form = event.target;
  const formData = new FormData(form);
  const audioFile = formData.get("audioFile");

  const fileName = audioFile.name;
  const title = formData.get("title").trim() || fileName.replace(/\.mp3$/i, "");

  if (!audioFile || !audioFile.name) {
    showToast("请选择 mp3 文件", "error");
    return;
  }

  if (audioFile.size > 30 * 1024 * 1024) {
    showToast("音频文件不能超过 30MB", "error");
    return;
  }

  audioResources.unshift({
    id: Date.now(),
    bookId,
    title,
    fileName,
    duration: formData.get("duration").trim() || "未知",
    uploadedAt: formatDate(new Date())
  });

  persistState();
  closeModal();
  showToast("音频资源已上传");
  viewBookDetail(bookId);
}

function deleteAudio(id) {
  if (!isAdmin()) {
    showToast("普通成员无权操作", "error");
    return;
  }

  const audio = audioResources.find(item => item.id === id);
  if (!audio) return;

  const confirmed = confirm(`确认删除音频「${audio.title}」吗？`);
  if (!confirmed) return;

  const bookId = audio.bookId;
  audioResources = audioResources.filter(item => item.id !== id);
  persistState();
  showToast("音频资源已删除");
  renderAudioList(bookId);
}



/* 读书计划 */
function renderReadingPlansPage() {
  const content = document.getElementById("content");

  content.innerHTML = `
    ${renderMetricsPanel()}
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">读书计划</h2>
        </div>
        <div class="toolbar">
          <button class="btn btn-primary" onclick="openReadingPlanForm()">添加读书计划</button>
        </div>
      </div>
      <div id="readingPlansTable"></div>
    </div>
  `;

  renderReadingPlansTable();
}

function getVisibleReadingPlans() {
  if (isAdmin()) return readingPlans;
  return readingPlans.filter(plan => plan.userId === currentUser.id);
}

function canEditReadingPlan(plan) {
  return isAdmin() || plan.userId === currentUser.id;
}

function getBookById(id) {
  return books.find(book => book.id === id);
}

function getMemberNameById(id) {
  const member = members.find(item => item.id === id);
  if (member) return member.name;

  const user = MOCK_USERS.find(item => item.id === id);
  return user ? user.name : "未知成员";
}

function renderReadingPlansTable() {
  const container = document.getElementById("readingPlansTable");
  const visiblePlans = getVisibleReadingPlans();

  const totalPages = Math.max(1, Math.ceil(visiblePlans.length / pageSize));
  if (readingPlanPage > totalPages) readingPlanPage = totalPages;

  const start = (readingPlanPage - 1) * pageSize;
  const pageData = visiblePlans.slice(start, start + pageSize);

  const ownerHeader = isAdmin() ? `<th>所属成员</th>` : "";

  const rows = pageData.map(plan => {
    const book = getBookById(plan.bookId);
    const bookTitle = book ? book.title : "未知书目";
    const ownerCell = isAdmin() ? `<td>${escapeHtml(getMemberNameById(plan.userId))}</td>` : "";
    const actionButtons = canEditReadingPlan(plan)
      ? `
        <button class="btn btn-warning btn-sm" onclick="openReadingPlanForm(${plan.id})">编辑</button>
        <button class="btn btn-danger btn-sm" onclick="deleteReadingPlan(${plan.id})">删除</button>
      `
      : "";

    return `
      <tr>
        <td>${escapeHtml(bookTitle)}</td>
        ${ownerCell}
        <td>${escapeHtml(plan.plannedDate || "未填写")}</td>
        <td>${escapeHtml(plan.actualDate || "未完成")}</td>
        <td>
          <div class="progress-wrap">
            <div class="progress-bar">
              <div class="progress-bar-inner" style="width:${Number(plan.progress) || 0}%"></div>
            </div>
            <div class="progress-text">${Number(plan.progress) || 0}%</div>
          </div>
        </td>
        <td>
          <div class="notes-preview">${escapeHtml(getNotesPreview(plan.notes))}</div>
        </td>
        <td>
          <div class="action-group">
            <button class="btn btn-light btn-sm" onclick="openReadingNotes(${plan.id})">心得</button>
            ${actionButtons}
          </div>
        </td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>书名</th>
            ${ownerHeader}
            <th>计划完成日期</th>
            <th>实际完成日期</th>
            <th>进度</th>
            <th>心得摘要</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="${isAdmin() ? 7 : 6}" style="text-align:center;color:#6b7280;">暂无数据</td></tr>`}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button class="btn btn-light btn-sm" onclick="changeReadingPlanPage(-1)" ${readingPlanPage === 1 ? "disabled" : ""}>上一页</button>
      <span class="page-info">第 ${readingPlanPage} / ${totalPages} 页，共 ${visiblePlans.length} 条</span>
      <button class="btn btn-light btn-sm" onclick="changeReadingPlanPage(1)" ${readingPlanPage === totalPages ? "disabled" : ""}>下一页</button>
    </div>
  `;
}

function getNotesPreview(notes) {
  if (!notes) return "暂无心得";
  const text = stripHtml(notes);
  return text.length > 40 ? text.slice(0, 40) + "..." : text;
}

function changeReadingPlanPage(delta) {
  const totalPages = Math.max(1, Math.ceil(getVisibleReadingPlans().length / pageSize));
  readingPlanPage = Math.min(totalPages, Math.max(1, readingPlanPage + delta));
  renderReadingPlansTable();
}

function openReadingPlanForm(id) {
  const isEdit = Boolean(id);
  const plan = isEdit
    ? readingPlans.find(item => item.id === id)
    : {
      userId: currentUser.id,
      bookId: books[0] ? books[0].id : "",
      plannedDate: "",
      actualDate: "",
      progress: 0,
      notes: ""
    };

  if (!plan) return;

  if (isEdit && !canEditReadingPlan(plan)) {
    showToast("你没有权限编辑该读书计划", "error");
    return;
  }

  if (!books.length) {
    showToast("请先添加书目", "error");
    return;
  }

  const bookOptions = books.map(book => {
    return `<option value="${book.id}" ${Number(plan.bookId) === book.id ? "selected" : ""}>${escapeHtml(book.title)} - ${escapeHtml(book.author)}</option>`;
  }).join("");

  const memberOptions = members.map(member => {
    return `<option value="${member.id}" ${Number(plan.userId) === member.id ? "selected" : ""}>${escapeHtml(member.name)}</option>`;
  }).join("");

  const ownerField = isAdmin()
    ? `
      <div class="form-group">
        <label>所属成员</label>
        <select class="form-control" name="userId" required>${memberOptions}</select>
      </div>
    `
    : `<input type="hidden" name="userId" value="${currentUser.id}" />`;

  openModal(isEdit ? "编辑读书计划" : "添加读书计划", `
    <form onsubmit="saveReadingPlan(event, ${isEdit ? id : "null"})">
      <div class="form-grid">
        <div class="form-group">
          <label>书名</label>
          <select class="form-control" name="bookId" required>${bookOptions}</select>
        </div>

        ${ownerField}

        <div class="form-group">
          <label>计划完成日期</label>
          <input class="form-control" name="plannedDate" type="date" required value="${escapeHtml(plan.plannedDate || "")}" />
        </div>

        <div class="form-group">
          <label>实际完成日期</label>
          <input class="form-control" name="actualDate" type="date" value="${escapeHtml(plan.actualDate || "")}" />
        </div>

        <div class="form-group full">
          <label>进度：<span id="progressText">${Number(plan.progress) || 0}</span>%</label>
          <input
            class="form-control"
            name="progress"
            type="range"
            min="0"
            max="100"
            value="${Number(plan.progress) || 0}"
            oninput="document.getElementById('progressText').textContent = this.value"
          />
        </div>

        <div class="form-group full">
          <label>读书心得</label>
          ${renderRichEditor("planNotesEditor", plan.notes || "")}
        </div>
      </div>

      <div class="form-footer">
        <button type="button" class="btn btn-light" onclick="closeModal()">取消</button>
        <button type="submit" class="btn btn-primary">保存</button>
      </div>
    </form>
  `);
}

function saveReadingPlan(event, id) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const userId = isAdmin() ? Number(formData.get("userId")) : currentUser.id;

  const plannedDate = formData.get("plannedDate");
  const actualDate = formData.get("actualDate");

  if (actualDate && new Date(actualDate) < new Date(plannedDate)) {
    showToast("实际完成日期不能早于计划完成日期", "error");
    return;
  }

  const data = {
    userId,
    bookId: Number(formData.get("bookId")),
    plannedDate,
    actualDate,
    progress: Number(formData.get("progress")),
    notes: getRichEditorValue("planNotesEditor")
  };

  if (id) {
    const index = readingPlans.findIndex(item => item.id === id);
    if (index !== -1) {
      if (!canEditReadingPlan(readingPlans[index])) {
        showToast("你没有权限编辑该读书计划", "error");
        return;
      }
      readingPlans[index] = { ...readingPlans[index], ...data };
    }
    showToast("读书计划已更新");
  } else {
    readingPlans.unshift({
      id: Date.now(),
      ...data
    });
    showToast("读书计划已添加");
  }

  persistState();
  closeModal();
  renderReadingPlansPage();
}

function deleteReadingPlan(id) {
  const plan = readingPlans.find(item => item.id === id);
  if (!plan) return;

  if (!canEditReadingPlan(plan)) {
    showToast("你没有权限删除该读书计划", "error");
    return;
  }

  const book = getBookById(plan.bookId);
  const confirmed = confirm(`确认删除读书计划「${book ? book.title : "未知书目"}」吗？`);
  if (!confirmed) return;

  readingPlans = readingPlans.filter(item => item.id !== id);
  persistState();
  closeModal();
  showToast("读书计划已删除");
  renderReadingPlansPage();
}

function openReadingNotes(id) {
  const plan = readingPlans.find(item => item.id === id);
  if (!plan) return;

  const book = getBookById(plan.bookId);
  const canEdit = canEditReadingPlan(plan);

  openModal("读书心得", `
    <form onsubmit="saveReadingNotes(event, ${id})">
      <div class="detail-grid" style="margin-bottom:16px;">
        <div class="detail-label">书名</div><div class="detail-value">${escapeHtml(book ? book.title : "未知书目")}</div>
        <div class="detail-label">所属成员</div><div class="detail-value">${escapeHtml(getMemberNameById(plan.userId))}</div>
      </div>

      <div class="form-group">
        <label>心得内容</label>
        ${canEdit ? renderRichEditor("notesEditor", plan.notes || "") : `<div class="rich-editor-view">${sanitizeHtml(plan.notes || "") || '<span class="text-muted">暂无心得</span>'}</div>`}
      </div>

      <div class="form-footer">
        <button type="button" class="btn btn-light" onclick="closeModal()">关闭</button>
        ${canEdit ? `<button type="submit" class="btn btn-primary">保存心得</button>` : ""}
      </div>
    </form>
  `);
}

function saveReadingNotes(event, id) {
  event.preventDefault();

  const plan = readingPlans.find(item => item.id === id);
  if (!plan) return;

  if (!canEditReadingPlan(plan)) {
    showToast("你没有权限编辑该心得", "error");
    return;
  }

  plan.notes = getRichEditorValue("notesEditor");
  persistState();

  closeModal();
  showToast("读书心得已保存");
  renderReadingPlansPage();
}


/* 占位页面 */
function renderPlaceholderPage(page) {
  const pageNameMap = {
    schedules: "日程安排",
    trainings: "培训项目",
    books: "书目库 / 听书"
  };

  document.getElementById("content").innerHTML = `
    <div class="card">
      <div class="placeholder">
        <h2>${pageNameMap[page] || page}</h2>
        <p>此功能模块暂未开放。</p>
      </div>
    </div>
  `;
}

/* 弹窗与提示 */
function openModal(title, bodyHtml) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = bodyHtml;
  document.getElementById("modalMask").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modalMask").classList.add("hidden");
  document.getElementById("modalBody").innerHTML = "";
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");

  if (type === "error") {
    toast.style.background = "#dc2626";
  } else {
    toast.style.background = "#111827";
  }

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 1800);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* 富文本工具 */
function sanitizeHtml(html) {
  if (!html) return "";
  const allowed = new Set(["b", "i", "strong", "em", "ul", "ol", "li", "p", "br", "div", "span"]);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  function clean(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName.toLowerCase();
    if (!allowed.has(tag)) {
      const frag = document.createDocumentFragment();
      while (node.firstChild) frag.appendChild(node.firstChild);
      node.parentNode.replaceChild(frag, node);
      return;
    }
    Array.from(node.attributes).forEach(attr => {
      if (attr.name.startsWith("on") || ["href", "src", "action"].includes(attr.name)) {
        node.removeAttribute(attr.name);
      }
    });
    Array.from(node.childNodes).forEach(clean);
  }

  Array.from(doc.body.childNodes).forEach(clean);
  return doc.body.innerHTML;
}

function stripHtml(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = sanitizeHtml(html);
  return div.textContent || div.innerText || "";
}

function renderRichEditor(editorId, value) {
  const sanitized = sanitizeHtml(value || "");
  return `
    <div class="rich-editor-wrap">
      <div class="rich-editor-toolbar">
        <button type="button" class="rte-btn" title="粗体" onmousedown="event.preventDefault();document.getElementById('${editorId}').focus();document.execCommand('bold')"><b>B</b></button>
        <button type="button" class="rte-btn" title="斜体" onmousedown="event.preventDefault();document.getElementById('${editorId}').focus();document.execCommand('italic')"><i>I</i></button>
        <button type="button" class="rte-btn" title="无序列表" onmousedown="event.preventDefault();document.getElementById('${editorId}').focus();document.execCommand('insertUnorderedList')">• 列表</button>
        <button type="button" class="rte-btn" title="有序列表" onmousedown="event.preventDefault();document.getElementById('${editorId}').focus();document.execCommand('insertOrderedList')">1. 列表</button>
      </div>
      <div id="${editorId}" class="rich-editor" contenteditable="true">${sanitized}</div>
    </div>
  `;
}

function getRichEditorValue(editorId) {
  const el = document.getElementById(editorId);
  return el ? sanitizeHtml(el.innerHTML) : "";
}
