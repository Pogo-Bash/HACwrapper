import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import compression from 'compression';
import { LRUCache } from 'lru-cache';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Compression level (0-9, 6 is good balance)
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// Use environment PORT variable (critical for Render deployment)
const PORT = process.env.PORT || 3001;

// ==========================================
// SERVE STATIC FILES (Built Frontend)
// ==========================================
// Serve static files from dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// ==========================================
// CACHING SETUP
// ==========================================
const cache = new LRUCache({
  max: 500, // Maximum 500 items in cache
  ttl: 1000 * 60 * 5, // 5 minutes TTL
  updateAgeOnGet: true,
  updateAgeOnHas: false,
});

// Cache key generator
function getCacheKey(type, user, ...params) {
  return `${type}:${user}:${params.join(':')}`;
}

class ETHSHACScraper {
  constructor(hacUrl, username, password) {
    this.hacUrl = hacUrl.endsWith('/') ? hacUrl : hacUrl + '/';
    this.username = username;
    this.password = password;
    this.cookieJar = {};
  }

  getCookieString() {
    return Object.entries(this.cookieJar)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  parseCookies(setCookieHeaders) {
    if (!setCookieHeaders) return;
    const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    cookieArray.forEach(cookie => {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      if (name && value) {
        this.cookieJar[name.trim()] = value.trim();
      }
    });
  }

  async login() {
    try {
      const loginUrl = `${this.hacUrl}HomeAccess/Account/LogOn`;
      
      const loginPageResponse = await axios.get(loginUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      
      this.parseCookies(loginPageResponse.headers['set-cookie']);
      const $ = cheerio.load(loginPageResponse.data);
      const token = $('input[name="__RequestVerificationToken"]').val();
      
      if (!token) return false;
      
      const loginData = new URLSearchParams({
        '__RequestVerificationToken': token,
        'Database': '10',
        'VerificationOption': 'UsernamePassword',
        'LogOnDetails.UserName': this.username,
        'LogOnDetails.Password': this.password,
        'tempUN': '',
        'tempPW': ''
      });
      
      const loginResponse = await axios.post(loginUrl, loginData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': this.getCookieString(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': loginUrl
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      });
      
      this.parseCookies(loginResponse.headers['set-cookie']);
      
      if (loginResponse.status === 302 || loginResponse.status === 301) {
        let redirectUrl = loginResponse.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = `${this.hacUrl.replace(/\/$/, '')}${redirectUrl}`;
        }
        const redirectResponse = await axios.get(redirectUrl, {
          headers: {
            'Cookie': this.getCookieString(),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': loginUrl
          },
          maxRedirects: 5
        });
        this.parseCookies(redirectResponse.headers['set-cookie']);
      }
      
      return true;
    } catch (error) {
      console.error('  💥 Login error:', error.message);
      return false;
    }
  }

  async getStudentName() {
    if (!await this.login()) return { name: 'Student', error: 'Login failed' };
    const url = `${this.hacUrl}HomeAccess/Home/WeekView`;
    const response = await axios.get(url, {
      headers: { 
        'Cookie': this.getCookieString(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    const name = $('.sg-banner-menu-element.sg-menu-element-identity span').first().text().trim();
    return { name: name || 'Student' };
  }

  async getClassAverages() {
    if (!await this.login()) return [];
    const url = `${this.hacUrl}HomeAccess/Home/WeekView`;
    const response = await axios.get(url, {
      headers: { 
        'Cookie': this.getCookieString(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    const classes = [];
    const seenClasses = new Set();

    $('.sg-homeview-table tbody tr').each((i, row) => {
      const $row = $(row);
      const cells = $row.find('td');
      if (cells.length < 2) return;

      const $firstCell = cells.eq(0);
      const $classLink = $firstCell.find('a.sg-font-larger');
      const className = $classLink.text().trim();
      if (!className || className === 'Class') return;

      const onclick = $classLink.attr('onclick') || '';
      const classIdMatch = onclick.match(/ViewClassPopUp\((\d+)/);
      const classId = classIdMatch ? classIdMatch[1] : null;
      
      const spans = $firstCell.find('span');
      let courseCode = '', period = '';
      spans.each((j, span) => {
        const text = $(span).text().trim();
        const codeMatch = text.match(/\(([A-Z0-9]+)/);
        const periodMatch = text.match(/Per:\s*([^\s]+)/);
        if (codeMatch) courseCode = codeMatch[1];
        if (periodMatch) period = periodMatch[1];
      });
      
      const $teacherLink = $firstCell.find('a#staffName');
      const teacher = $teacherLink.text().trim();
      const teacherEmail = $teacherLink.attr('href')?.replace('mailto:', '') || '';
      
      const $secondCell = cells.eq(1);
      const $gradeLink = $secondCell.find('a.sg-font-larger-average');
      const gradeText = $gradeLink.text().trim();
      const gradeMatch = gradeText.match(/[\d.]+/);
      const average = gradeMatch ? parseFloat(gradeMatch[0]) : null;

      const classKey = `${classId}-${className}`;
      if (seenClasses.has(classKey)) return;
      seenClasses.add(classKey);

      classes.push({
        classId,
        className,
        courseCode,
        teacher,
        teacherEmail,
        period,
        grade: gradeText || 'N/A',
        average: average !== null ? average : 0,
        hasGrade: !!gradeText
      });
    });

    return classes;
  }

  async getClassGrades(className, markingPeriod = 1) {
    if (!await this.login()) {
      return { error: 'Login failed' };
    }

    try {
      const weekViewUrl = `${this.hacUrl}HomeAccess/Home/WeekView`;
      const weekViewResponse = await axios.get(weekViewUrl, {
        headers: { 
          'Cookie': this.getCookieString(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $week = cheerio.load(weekViewResponse.data);
      let sectionKey = null;
      
      $week('.sg-homeview-table tbody tr').each((i, row) => {
        const $row = $week(row);
        const cells = $row.find('td');
        if (cells.length < 2) return;
        
        const $firstCell = cells.eq(0);
        const $classLink = $firstCell.find('a.sg-font-larger');
        const foundClassName = $classLink.text().trim();
        
        if (!foundClassName) return;
        
        const normalizedFound = foundClassName.replace(/\s+/g, ' ').trim();
        const normalizedSearch = className.replace(/\s+/g, ' ').trim();
        
        if (normalizedFound === normalizedSearch) {
          const $secondCell = cells.eq(1);
          const $gradeLink = $secondCell.find('a.sg-font-larger-average');
          const gradeHref = $gradeLink.attr('href') || '';
          
          const match = gradeHref.match(/ViewAssignmentsRCPopUp\((\d+)/);
          
          if (match) {
            sectionKey = match[1];
            return false;
          }
        }
      });

      if (!sectionKey) {
        return { 
          className,
          teacher: '',
          average: 'N/A',
          lastUpdated: '',
          assignments: [],
          categories: [],
          markingPeriods: [1, 2, 3, 4],
          currentMarkingPeriod: markingPeriod,
          error: 'Class not found'
        };
      }

      const assignmentsUrl = `${this.hacUrl}HomeAccess/Content/Student/AssignmentsFromRCPopUp.aspx?section_key=${sectionKey}&course_session=1&RC_RUN=${markingPeriod}&MARK_TITLE=MP&MARK_TYPE=MP&SLOT_INDEX=${markingPeriod}`;
      
      const assignmentsResponse = await axios.get(assignmentsUrl, {
        headers: { 
          'Cookie': this.getCookieString(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(assignmentsResponse.data);

      const classTitle = $('.asmt_link').first().text().trim();
      const avgText = $('.headeravg').text().trim();
      const avgMatch = avgText.match(/([\d.]+)%/);
      const average = avgMatch ? avgMatch[1] + '%' : 'N/A';
      const lastUpdated = $('.lastupdated').text().trim();

      const assignments = [];
      const assignmentRows = $('table.sg-asp-table tbody tr.sg-asp-table-data-row');
      
      assignmentRows.each((i, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length >= 11) {
          const assignmentName = $(cells[3]).find('a').text().trim() || $(cells[3]).text().trim();
          
          assignments.push({
            dateDue: $(cells[0]).text().trim(),
            dateAssigned: $(cells[1]).text().trim(),
            turnedIn: $(cells[2]).text().trim(),
            name: assignmentName,
            category: $(cells[4]).text().trim(),
            score: $(cells[5]).text().trim(),
            weight: $(cells[6]).text().trim(),
            weightedScore: $(cells[7]).text().trim(),
            totalPoints: $(cells[8]).text().trim(),
            weightedTotalPoints: $(cells[9]).text().trim(),
            percentage: $(cells[10]).text().trim()
          });
        }
      });

      const categories = [];
      const categoryRows = $('#plnMain_rptAssigmnetsByCourse_dgCourseCategories_0 tbody tr.sg-asp-table-data-row');
      
      categoryRows.each((i, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length >= 4 && $row.find('b').length === 0) {
          categories.push({
            name: $(cells[0]).text().trim(),
            points: $(cells[1]).text().trim(),
            maxPoints: $(cells[2]).text().trim(),
            percentage: $(cells[3]).text().trim()
          });
        }
      });

      return {
        className: classTitle || className,
        teacher: '',
        average,
        lastUpdated,
        assignments,
        categories,
        markingPeriods: [1, 2, 3, 4],
        currentMarkingPeriod: markingPeriod
      };

    } catch (error) {
      console.error(`  💥 Error fetching class grades:`, error.message);
      return { 
        className,
        teacher: '',
        average: 'N/A',
        lastUpdated: '',
        assignments: [],
        categories: [],
        markingPeriods: [1, 2, 3, 4],
        currentMarkingPeriod: markingPeriod,
        error: error.message 
      };
    }
  }
}

// ==========================================
// API ENDPOINTS WITH CACHING
// ==========================================

app.post('/api/name', async (req, res) => {
  try {
    const { link, user, pass } = req.body;
    if (!link || !user || !pass) return res.status(400).json({ error: 'Missing parameters' });
    
    const cacheKey = getCacheKey('name', user);
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`  ⚡ Cache hit: name for ${user}`);
      return res.json(cached);
    }
    
    const scraper = new ETHSHACScraper(link, user, pass);
    const result = await scraper.getStudentName();
    
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('💥', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/classaverage', async (req, res) => {
  try {
    const { link, user, pass } = req.body;
    if (!link || !user || !pass) return res.status(400).json({ error: 'Missing parameters' });
    
    const cacheKey = getCacheKey('classes', user);
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`  ⚡ Cache hit: classes for ${user}`);
      return res.json(cached);
    }
    
    const scraper = new ETHSHACScraper(link, user, pass);
    const result = await scraper.getClassAverages();
    
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('💥', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/classgrade', async (req, res) => {
  try {
    const { link, user, pass, class: className, markingPeriod = 1 } = req.body;
    if (!link || !user || !pass || !className) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    
    const cacheKey = getCacheKey('grade', user, className, markingPeriod);
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`  ⚡ Cache hit: ${className} Q${markingPeriod}`);
      return res.json(cached);
    }
    
    const scraper = new ETHSHACScraper(link, user, pass);
    const result = await scraper.getClassGrades(className, markingPeriod);
    
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('💥', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    status: 'ETHS HAC Proxy - OPTIMIZED ⚡', 
    version: '8.0 (Caching + Compression)',
    features: ['Server-side caching', 'Gzip compression', 'LRU cache']
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'Proxy server is healthy ✅',
    cache: {
      size: cache.size,
      max: cache.max
    }
  });
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n⚡ ETHS HAC Proxy v8.0 - PRODUCTION READY FOR RENDER`);
  console.log(`📍 Running on port ${PORT}`);
  console.log(`✅ Compression: Enabled`);
  console.log(`✅ Caching: LRU (5 min TTL)`);
  console.log(`✅ Max cache size: 500 items`);
  console.log(`✅ Static files: ${distPath}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
