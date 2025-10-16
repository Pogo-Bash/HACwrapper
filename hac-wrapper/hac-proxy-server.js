import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();

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

const PORT = 3001;

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
      console.log('  🔐 Logging in...');
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
      
      console.log('  ✅ Login successful!');
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
    console.log('  📝 Name:', name);
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

    console.log(`  📚 Total: ${classes.length} classes`);
    return classes;
  }
}

// 🔒 SECURE: POST endpoint for name (credentials in body)
app.post('/api/name', async (req, res) => {
  try {
    const { link, user, pass } = req.body;
    if (!link || !user || !pass) return res.status(400).json({ error: 'Missing parameters' });
    console.log(`\n📝 POST /api/name - User: ${user}`);
    const scraper = new ETHSHACScraper(link, user, pass);
    const result = await scraper.getStudentName();
    console.log(`   Result: ${result.name}\n`);
    res.json(result);
  } catch (error) {
    console.error('💥', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🔒 SECURE: POST endpoint for classes (credentials in body)
app.post('/api/classaverage', async (req, res) => {
  try {
    const { link, user, pass } = req.body;
    if (!link || !user || !pass) return res.status(400).json({ error: 'Missing parameters' });
    console.log(`\n📚 POST /api/classaverage - User: ${user}`);
    const scraper = new ETHSHACScraper(link, user, pass);
    const result = await scraper.getClassAverages();
    console.log(`   Returning ${result.length} classes\n`);
    res.json(result);
  } catch (error) {
    console.error('💥', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ETHS HAC Proxy - SECURE ✅', 
    version: '6.0 (POST endpoints)',
    security: 'Credentials sent in request body, not URL'
  });
});

app.listen(PORT, () => {
  console.log(`\n🔒 ETHS HAC Proxy v6.0 - SECURE VERSION`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`✅ Using POST requests (credentials in body, NOT in URL)`);
  console.log(`✅ CORS enabled\n`);
});