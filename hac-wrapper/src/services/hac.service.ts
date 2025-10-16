import type {
  HACCredentials,
  StudentInfo,
  ClassInfo,
  ClassGrades,
  Transcript,
  IPR,
  ReportCard,
  Schedule,
  HACApiResponse,
} from '../types/hac.types';

/**
 * HAC API Service
 * Now uses direct HAC scraping via proxy server
 */
export class HACApiService {
  private static readonly BASE_URL = '/api';

  /**
   * Build query parameters for API requests
   */
  private static buildQueryParams(credentials: HACCredentials): string {
    const params = new URLSearchParams({
      link: credentials.hacUrl,
      user: credentials.username,
      pass: credentials.password,
    });
    return params.toString();
  }

  /**
   * Make API request with error handling
   */
  private static async makeRequest<T>(
    endpoint: string,
    credentials: HACCredentials
  ): Promise<HACApiResponse<T>> {
    try {
      const queryParams = this.buildQueryParams(credentials);
      const url = `${this.BASE_URL}/${endpoint}?${queryParams}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: 'Empty response from server',
        };
      }

      const data = JSON.parse(text);

      // Check if API returned an error
      if (data.error) {
        return {
          success: false,
          error: data.error,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`HAC API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get student name
   */
  static async getStudentName(credentials: HACCredentials): Promise<HACApiResponse<StudentInfo>> {
    return this.makeRequest<StudentInfo>('name', credentials);
  }

  /**
   * Get class averages
   */
  static async getClassAverages(credentials: HACCredentials): Promise<HACApiResponse<ClassInfo[]>> {
    return this.makeRequest<ClassInfo[]>('classaverage', credentials);
  }

  /**
   * Get detailed grades for a specific class
   */
  static async getClassGrades(
    credentials: HACCredentials,
    classId: string
  ): Promise<HACApiResponse<ClassGrades>> {
    const queryParams = this.buildQueryParams(credentials);
    const url = `${this.BASE_URL}/classgrade?${queryParams}&class=${encodeURIComponent(classId)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.error) {
        return { success: false, error: data.error };
      }
      
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get transcript
   */
  static async getTranscript(credentials: HACCredentials): Promise<HACApiResponse<Transcript[]>> {
    return this.makeRequest<Transcript[]>('transcript', credentials);
  }

  /**
   * Get Interim Progress Report (IPR)
   */
  static async getIPR(credentials: HACCredentials): Promise<HACApiResponse<IPR>> {
    return this.makeRequest<IPR>('ipr', credentials);
  }

  /**
   * Get Report Card
   */
  static async getReportCard(credentials: HACCredentials): Promise<HACApiResponse<ReportCard>> {
    return this.makeRequest<ReportCard>('reportcard', credentials);
  }

  /**
   * Get class schedule
   */
  static async getSchedule(credentials: HACCredentials): Promise<HACApiResponse<Schedule>> {
    return this.makeRequest<Schedule>('schedule', credentials);
  }

  /**
   * Get class rank
   */
  static async getClassRank(credentials: HACCredentials): Promise<HACApiResponse<any>> {
    return this.makeRequest('rank', credentials);
  }

  /**
   * Validate credentials by attempting to fetch student name
   */
  static async validateCredentials(credentials: HACCredentials): Promise<boolean> {
    const response = await this.getStudentName(credentials);
    return response.success && !!response.data?.name;
  }
}
