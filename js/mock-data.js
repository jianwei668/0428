/*
 * 人才项目资料管理系统 - 静态演示数据
 * 说明：本文件存放用户、成员、日程、培训、书目、听书资源、读书计划等 mock 数据。
 */
const MOCK_USERS = [
  {
    id: 1,
    username: "admin",
    password: "123456",
    name: "系统管理员",
    role: "admin"
  },
  {
    id: 2,
    username: "member",
    password: "123456",
    name: "普通成员",
    role: "member"
  }
];

let members = [
  {
    id: 1,
    name: "张三",
    gender: "男",
    phone: "13800000000",
    email: "zhangsan@example.com",
    campus: "总部",
    position: "项目成员",
    batch: "第一期",
    intro: "负责项目资料整理与培训参与。",
    photoName: "",
    resumeName: "张三简历.pdf"
  },
  {
    id: 2,
    name: "李四",
    gender: "女",
    phone: "13900000000",
    email: "lisi@example.com",
    campus: "观南中心",
    position: "培训专员",
    batch: "第一期",
    intro: "关注人才培养与读书计划推进。",
    photoName: "",
    resumeName: ""
  },
  {
    id: 3,
    name: "王五",
    gender: "男",
    phone: "13700000000",
    email: "wangwu@example.com",
    campus: "双楠中心",
    position: "项目助理",
    batch: "第一期",
    intro: "负责日程协同和成员资料维护。",
    photoName: "",
    resumeName: "王五简历.pdf"
  }
];

const CAMPUS_OPTIONS = [
  "总部",
  "观南中心",
  "双楠中心",
  "鹭洲里中心",
  "凯德中心",
  "优品道中心",
  "金沙中心",
  "华润中心",
  "建设路中心",
  "合生汇中心"
];

let schedules = [
  {
    id: 1,
    title: "项目启动会",
    type: "public",
    creatorId: 1,
    creatorName: "系统管理员",
    startTime: "2026-04-28T09:00",
    endTime: "2026-04-28T10:00",
    description: "第一期人才项目资料管理系统启动会议。"
  },
  {
    id: 2,
    title: "读书计划沟通",
    type: "personal",
    creatorId: 2,
    creatorName: "普通成员",
    startTime: "2026-04-29T14:00",
    endTime: "2026-04-29T15:00",
    description: "确认个人读书计划和心得提交节奏。"
  },
  {
    id: 3,
    title: "培训资料准备",
    type: "public",
    creatorId: 1,
    creatorName: "系统管理员",
    startTime: "2026-05-03T10:00",
    endTime: "2026-05-03T11:30",
    description: "整理第一期培训项目材料。"
  }
];

let trainings = [
  {
    id: 1,
    name: "前端基础培训",
    startTime: "2026-05-08T09:00",
    endTime: "2026-05-08T12:00",
    location: "总部会议室",
    description: "围绕静态页面、表单、表格和基础交互进行培训。",
    participantIds: [1, 2, 3],
    attachmentName: "前端基础培训资料.pdf"
  },
  {
    id: 2,
    name: "项目资料规范培训",
    startTime: "2026-05-12T14:00",
    endTime: "2026-05-12T16:00",
    location: "观南中心",
    description: "统一成员资料、简历、照片和读书计划的维护规范。",
    participantIds: [1, 2],
    attachmentName: "项目资料规范.docx"
  }
];

let books = [
  {
    id: 1,
    title: "高效能人士的七个习惯",
    author: "史蒂芬·柯维",
    isbn: "9787508696888",
    category: "管理",
    coverName: "",
    intro: "本书围绕个人成长、目标管理、人际协作和持续更新展开，是管理类经典读物。"
  },
  {
    id: 2,
    title: "代码整洁之道",
    author: "Robert C. Martin",
    isbn: "9787115216878",
    category: "技术",
    coverName: "",
    intro: "本书介绍如何编写可读、可维护、可扩展的高质量代码。"
  },
  {
    id: 3,
    title: "刻意练习",
    author: "安德斯·艾利克森",
    isbn: "9787111551287",
    category: "人文",
    coverName: "",
    intro: "本书讲述高水平能力形成的底层方法，强调目标明确、反馈及时和持续改进。"
  }
];

let audioResources = [
  {
    id: 1,
    bookId: 1,
    title: "第一章：由内而外全面造就自己",
    fileName: "seven-habits-chapter-1.mp3",
    duration: "12:30",
    uploadedAt: "2026-04-27"
  },
  {
    id: 2,
    bookId: 1,
    title: "第二章：以终为始",
    fileName: "seven-habits-chapter-2.mp3",
    duration: "15:20",
    uploadedAt: "2026-04-28"
  },
  {
    id: 3,
    bookId: 2,
    title: "整洁代码导读",
    fileName: "clean-code-intro.mp3",
    duration: "09:45",
    uploadedAt: "2026-05-01"
  }
];

let readingPlans = [
  {
    id: 1,
    userId: 2,
    bookId: 1,
    plannedDate: "2026-06-01",
    actualDate: "",
    progress: 30,
    notes: "目前读到目标管理部分，准备结合自己的工作任务做一次实践。"
  },
  {
    id: 2,
    userId: 1,
    bookId: 2,
    plannedDate: "2026-05-30",
    actualDate: "",
    progress: 60,
    notes: "代码命名和函数拆分部分很适合后续前端页面重构时参考。"
  }
];

