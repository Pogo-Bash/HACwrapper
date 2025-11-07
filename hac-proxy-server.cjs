/**
 * HAC Proxy Server
 * Acts as a middleman between your Vue app and any HAC district
 * Run: npm run proxy
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

/**
 * Direct HAC Scraper Class
 */
class DirectHACScraper {
  constructor(hacUrl, username, password) {
    this.hacUrl = hacUrl.endsWith('/') ? hacUrl : hacUrl + '/';
    this.username = username;
    this.password = password;
    this.cookies = '';
  }

  async login() {
    try {
      console.log('  🔐 Logging in...');
      const loginUrl = `${this.hacUrl}HomeAccess/Account/LogOn`;
      const loginData = `Database=10&LogOnDetails.UserName=${encodeURIComponent(this.username)}&LogOnDetails.Password=${encodeURIComponent(this.password)}`;

      const response = await axios.post(loginUrl, loginData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxRedirects: 5,
        validateStatus: () => true
      });

      const setCookies = response.headers['set-cookie'];
      if (setCookies) {
        this.cookies = setCookies.map(cookie => cookie.split(';')[0]).join('; ');
        console.log('  ✅ Login successful');
        return true;
      }
      console.log('  ❌ Login failed - no cookies received');
      return false;
    } catch (error) {
      console.error('  ❌ Login error:', error.message);
      return false;
    }
  }

  async getStudentName() {
    await this.login();
    const url = `${this.hacUrl}HomeAccess/Content/Student/Classes.aspx`;
    
    const response = await axios.get(url, {
      headers: { 'Cookie': this.cookies, 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(response.data);
    let name = $('#plnMain_lblStudentName').text().trim();
    if (!name) name = $('.StudentName').first().text().trim();
    if (!name) name = $('#lblStudentName').text().trim();
    if (!name) name = $('span[id*="StudentName"]').first().text().trim();

    console.log('  📝 Student name:', name || 'Not found');
    return { name: name || 'Student' };
  }

  async getClassAverages() {
    await this.login();
    const url = `${this.hacUrl}HomeAccess/Content/Student/Classes.aspx`;
    
    const response = await axios.get(url, {
      headers: { 'Cookie': this.cookies, 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(response.data);
    const classes = [];

    // Try multiple table selectors for different HAC versions
    const tables = $('.sg-asp-table, table.InfoTable, #plnMain_dgClassesMarks, table[class*="Class"]');
    
    tables.each((tableIndex, table) => {
      $(table).find('tr').each((i, row) => {
        if (i === 0) return; // Skip header

        const cells = $(row).find('td');
        if (cells.length < 3) return;

        const className = cells.eq(0).text().trim();
        const courseCode = cells.eq(1).text().trim();
        const period = cells.eq(2).text().trim();
        const teacher = cells.eq(3).text().trim();
        const grade = cells.eq(4).text().trim();

        if (className && className !== 'Course' && className !== '') {
          const averageMatch = grade.match(/[\d.]+/);
          const average = averageMatch ? parseFloat(averageMatch[0]) : 0;

          classes.push({
            className,
            teacher: teacher || 'Teacher',
            period: period || 'N/A',
            grade: grade || 'N/A',
            average
          });
        }
      });
    });

    console.log(`  📚 Found ${classes.length} classes`);
    return classes;
  }

  async getClassGrades(classId) {
    await this.login();
    const url = `${this.hacUrl}HomeAccess/Content/Student/Assignments.aspx?FocusOnClassId=${classId}`;
    
    const response = await axios.get(url, {
      headers: { 'Cookie': this.cookies, 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(response.data);
    const assignments = [];

    $('.sg-asp-table, table.InfoTable').find('tr').each((i, row) => {
      if (i === 0) return;

      const cells = $(row).find('td');
      if (cells.length < 5) return;

      const name = cells.eq(0).text().trim();
      const category = cells.eq(1).text().trim();
      const dateAssigned = cells.eq(2).text().trim();
      const dateDue = cells.eq(3).text().trim();
      const score = cells.eq(4).text().trim();
      const totalPoints = cells.eq(5).text().trim();

      if (name && name !== 'Assignment') {
        assignments.push({
          name,
          category,
          dateAssigned,
          dateDue,
          score,
          totalPoints,
          weight: '1'
        });
      }
    });

    console.log(`  📖 Found ${assignments.length} assignments for class ${classId}`);
    return {
      className: classId,
      teacher: 'Teacher',
      period: 'N/A',
      categories: [],
      assignments
    };
  }
}

/**
 * API Endpoints
 */

// Get student name
app.get('/api/name', async (req, res) => {
  try {
    const { link, user, pass } = req.query;
    
    if (!link || !user || !pass) {
      return res.status(400).json({ error: 'Missing required parameters: link, user, pass' });
    }

    console.log(`\n📝 [${new Date().toLocaleTimeString()}] Getting name for ${user}`);

    const scraper = new DirectHACScraper(link, user, pass);
    const result = await scraper.getStudentName();
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get class averages
app.get('/api/classaverage', async (req, res) => {
  try {
    const { link, user, pass } = req.query;
    
    if (!link || !user || !pass) {
      return res.status(400).json({ error: 'Missing required parameters: link, user, pass' });
    }

    console.log(`\n📚 [${new Date().toLocaleTimeString()}] Getting class averages for ${user}`);

    const scraper = new DirectHACScraper(link, user, pass);
    const result = await scraper.getClassAverages();
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get class grades
app.get('/api/classgrade', async (req, res) => {
  try {
    const { link, user, pass, class: classId } = req.query;
    
    if (!link || !user || !pass || !classId) {
      return res.status(400).json({ error: 'Missing required parameters: link, user, pass, class' });
    }

    console.log(`\n📖 [${new Date().toLocaleTimeString()}] Getting grades for class ${classId}`);

    const scraper = new DirectHACScraper(link, user, pass);
    const result = await scraper.getClassGrades(classId);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'HAC Proxy Server is running!', 
    version: '2.0',
    endpoints: [
      'GET /api/name?link={hacUrl}&user={username}&pass={password}',
      'GET /api/classaverage?link={hacUrl}&user={username}&pass={password}',
      'GET /api/classgrade?link={hacUrl}&user={username}&pass={password}&class={classId}'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 HAC Proxy Server v2.0 is running!`);
  console.log(`${'='.repeat(70)}`);
  console.log(`\n📍 Server:     http://localhost:${PORT}`);
  console.log(`📖 Endpoints:  /api/name, /api/classaverage, /api/classgrade`);
  console.log(`\n✅ Ready to handle HAC requests from ANY school district!`);
  console.log(`${'='.repeat(70)}\n`);
});
