const fs = require('fs');
const path = require('path');

const profilePath = path.join(__dirname, '../data/profile.json');

function readProfiles() {
  if (!fs.existsSync(profilePath)) return [];
  const content = fs.readFileSync(profilePath, 'utf-8');
  if (!content.trim()) return [];
  const data = JSON.parse(content);
  return Array.isArray(data) ? data : [];
}

// 把字串分割成科目陣列，支援中文頓號、逗號、空格
function parseSubjects(str) {
  if (!str) return [];
  return str.split(/[、，,\s]+/).map(s => s.trim()).filter(Boolean);
}

// 把可讀書時段字串轉成分鐘數區間，方便比較重疊
function parseTimeRange(str) {
  if (!str) return null;
  // 支援格式：「晚上8:00-11:00」、「0800-0900」、「08:00-09:00」
  const match = str.match(/(\d{1,2}):?(\d{2})\s*[-~到]\s*(\d{1,2}):?(\d{2})/);
  if (!match) return null;
  const startMin = parseInt(match[1]) * 60 + parseInt(match[2]);
  const endMin   = parseInt(match[3]) * 60 + parseInt(match[4]);
  return { start: startMin, end: endMin };
}

function timeOverlap(a, b) {
  if (!a || !b) return 0;
  const overlapStart = Math.max(a.start, b.start);
  const overlapEnd   = Math.min(a.end, b.end);
  return Math.max(0, overlapEnd - overlapStart); // 重疊分鐘數
}

// 計算兩個 profile 的相似度，回傳 { score, reasons }
function calcMatch(me, other) {
  let score = 0;
  const reasons = [];

  // ── ① 相同課程（courseCode 完全相符）────────────────────────────
  const myCourses    = (me.courses    || []).map(c => c.courseCode);
  const otherCourses = (other.courses || []).map(c => c.courseCode);
  const sharedCodes  = myCourses.filter(code => otherCourses.includes(code));

  if (sharedCodes.length > 0) {
    const sharedNames = sharedCodes.map(code => {
      const found = (me.courses || []).find(c => c.courseCode === code);
      return found ? found.courseName : code;
    });
    score += sharedCodes.length * 30; // 每門共同課程 30 分
    reasons.push(`你們共同修了 ${sharedNames.join('、')}`);
  }

  // ── ② 弱科互補：我的弱科 ⊆ 對方的強科 ────────────────────────
  const myWeak       = parseSubjects(me.weakSubjects);
  const otherStrong  = parseSubjects(other.preferredSubjects);
  const otherWeak    = parseSubjects(other.weakSubjects);
  const myStrong     = parseSubjects(me.preferredSubjects);

  const canHelpMe    = myWeak.filter(s => otherStrong.includes(s));
  const iCanHelp     = otherWeak.filter(s => myStrong.includes(s));

  if (canHelpMe.length > 0) {
    score += canHelpMe.length * 20;
    reasons.push(`對方擅長你的弱科：${canHelpMe.join('、')}`);
  }
  if (iCanHelp.length > 0) {
    score += iCanHelp.length * 20;
    reasons.push(`你擅長對方的弱科：${iCanHelp.join('、')}`);
  }

  // ── ③ 相同弱科（一起加強）────────────────────────────────────
  const bothWeak = myWeak.filter(s => otherWeak.includes(s));
  if (bothWeak.length > 0) {
    score += bothWeak.length * 15;
    reasons.push(`你們都想加強：${bothWeak.join('、')}`);
  }

  // ── ④ 可讀書時段重疊 ─────────────────────────────────────────
  const myRange    = parseTimeRange(me.availableTime);
  const otherRange = parseTimeRange(other.availableTime);
  const overlap    = timeOverlap(myRange, otherRange);

  if (overlap >= 60) {
    score += 25;
    reasons.push(`可讀書時段高度重疊（${Math.round(overlap / 60)} 小時）`);
  } else if (overlap > 0) {
    score += 10;
    reasons.push(`可讀書時段有部分重疊（${overlap} 分鐘）`);
  }

  // ── ⑤ 考試目標日期相近（7 天內）──────────────────────────────
  if (me.examDate && other.examDate) {
    const diff = Math.abs(
      new Date(me.examDate).getTime() - new Date(other.examDate).getTime()
    );
    const diffDays = diff / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) {
      score += 15;
      reasons.push(`考試日期相近（相差 ${Math.round(diffDays)} 天）`);
    }
  }

  // ── ⑥ 每日讀書時數相近（差距 ≤ 1 小時）──────────────────────
  const myHours    = parseFloat(me.dailyStudyHours);
  const otherHours = parseFloat(other.dailyStudyHours);
  if (!isNaN(myHours) && !isNaN(otherHours) && Math.abs(myHours - otherHours) <= 1) {
    score += 10;
    reasons.push(`每日讀書時數相近（你 ${myHours}h，對方 ${otherHours}h）`);
  }

  // 沒有任何共同點就不列入
  if (reasons.length === 0) return null;

  // 分數上限 100
  const finalScore = Math.min(100, score);
  return { score: finalScore, reasons };
}

const getMatches = (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ status: 'error', message: '請提供 userId' });
    }

    const profiles = readProfiles();
    const me = profiles.find(p => String(p.id) === String(userId));

    if (!me) {
      return res.status(404).json({ status: 'error', message: '找不到使用者資料' });
    }

    const results = [];

    for (const other of profiles) {
      if (String(other.id) === String(userId)) continue; // 跳過自己

      const result = calcMatch(me, other);
      if (!result) continue;

      results.push({
        id:            other.id,
        name:          other.name,
        matchScore:    result.score,
        reasons:       result.reasons,
        weakSubjects:  other.weakSubjects  || '未填寫',
        preferredSubjects: other.preferredSubjects || '未填寫',
        availableTime: other.availableTime || '未填寫',
        examGoal:      other.examGoal      || '未填寫',
        examDate:      other.examDate      || '未填寫',
        dailyStudyHours: other.dailyStudyHours || '未填寫',
        courses:       other.courses       || [],
      });
    }

    // 依分數由高到低排序，最多回傳前 5 筆
    results.sort((a, b) => b.matchScore - a.matchScore);
    const top5 = results.slice(0, 5);

    res.status(200).json({ status: 'success', data: top5 });
  } catch (error) {
    console.error('配對失敗：', error);
    res.status(500).json({ status: 'error', message: '配對計算失敗' });
  }
};

module.exports = { getMatches };