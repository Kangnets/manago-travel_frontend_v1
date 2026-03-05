export interface PassportData {
  // 기본 정보
  type: string;           // 여권 종류 (P: 일반여권)
  countryCode: string;    // 발행국 코드
  surname: string;        // 성
  givenNames: string;     // 이름
  passportNumber: string; // 여권번호
  nationality: string;    // 국적
  dateOfBirth: string;    // 생년월일 (YYMMDD -> YYYY-MM-DD)
  sex: string;            // 성별 (M/F)
  expiryDate: string;     // 만료일 (YYMMDD -> YYYY-MM-DD)
  personalNumber: string; // 주민등록번호 (한국 여권의 경우)

  // 추가 정보
  koreanName?: string;    // 한글 이름 (OCR로 추출 시)
  isValid: boolean;       // MRZ 체크섬 유효성
  rawMrz: string[];       // 원본 MRZ 라인
  checkDigitStatus?: {    // 체크디짓 상세 결과
    passportOk: boolean;
    birthOk: boolean;
    expiryOk: boolean;
    overallCheck: string;
  };
}

export interface OcrResult {
  success: boolean;
  data?: PassportData;
  error?: string;
  confidence: number;
  processingTime: number;
}

export interface MrzLine {
  line1: string;  // 44자: 타입 + 발행국 + 이름
  line2: string;  // 44자: 여권번호 + 국적 + 생년월일 + 성별 + 만료일 + 주민번호
}
