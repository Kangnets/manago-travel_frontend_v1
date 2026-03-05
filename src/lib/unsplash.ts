// Unsplash 여행 이미지 컬렉션 - 베트남 전문 여행사용
// 모든 ID는 Unsplash API로 검증된 무료(non-Unsplash+) 사진입니다.

const BASE = 'https://images.unsplash.com';

// ─── 베트남 도시/지역별 ─────────────────────────────────────────────
export const vietnamPhotos = {
  halong:    `${BASE}/photo-1703555853329-b9fab31e92ad`, // Beautiful Halong Bay
  hoian:     `${BASE}/photo-1755709986407-f72e45084ff2`, // Colorful Lanterns at Hoi An
  danang:    `${BASE}/photo-1750015198421-b8190d7562c5`, // Da Nang beach with city skyline
  hanoi:     `${BASE}/photo-1713551584263-9881fefc5ad7`, // Hanoi wooden bridge over lake
  hochiminh: `${BASE}/photo-1510637844160-b5b7b335f369`, // Saigon street corner
  nhatrang:  `${BASE}/photo-1702529985429-19019b5fdc6d`, // Nha Trang Beaches
  phuquoc:   `${BASE}/photo-1567115220168-93d296e55a0a`, // Phu Quoc Lagoon
  dalat:     `${BASE}/photo-1770181280811-f76c9cb5a1c9`, // Da Lat misty valley
  mekong:    `${BASE}/photo-1744364348267-bcf7b3f3ddd0`, // Mekong boat in tropical waters
};

// ─── 골프 코스 (5종 각각 다른 분위기) ──────────────────────────────
export const golfPhotos = {
  tropical:  `${BASE}/photo-1758551932752-a9c603e25146`, // 열대 숲 속 골프장 (푸꾸옥용)
  coastal:   `${BASE}/photo-1766288020088-4b95f5409376`, // 바다 절경 골프장 (다낭용)
  green:     `${BASE}/photo-1593111774240-d529f12cf4bb`, // 넓은 그린 페어웨이 (하노이용)
  links:     `${BASE}/photo-1644647099751-36372c0d3386`, // 항공뷰 해안 코스 (나트랑용)
  highland:  `${BASE}/photo-1755144589277-a1b2d4ddda32`, // 숲+호수 고원 코스 (달랏용)
};

// ─── 호텔/리조트 ────────────────────────────────────────────────────
export const hotelPhotos = {
  infinityPool: `${BASE}/photo-1605537964076-3cb0ea2ff329`, // 럭셔리 인피니티 풀
  luxuryPool:   `${BASE}/photo-1761810399696-a2b97c7c2eb6`, // 야자수 반영 풀장
  beachfront:   `${BASE}/photo-1605538032432-a9f0c8d9baac`, // 비치프론트 빌라
  overwater:    `${BASE}/photo-1602217401791-a5fab1b8b775`, // 수상 방갈로 (몰디브 스타일)
};

// ─── 스파/웰니스 ────────────────────────────────────────────────────
export const spaPhotos = {
  massage:  `${BASE}/photo-1540555700478-4be289fbecef`, // 마사지/웰니스
  stone:    `${BASE}/photo-1544161515-4ab6ce6db874`,    // 스톤 테라피
  pool:     `${BASE}/photo-1515377905703-c4788e51af15`, // 스파 풀
};

// ─── 히어로 (대형 배경용) ────────────────────────────────────────────
export const heroPhotos = {
  main:   `${BASE}/photo-1703555853329-b9fab31e92ad`, // 하롱베이 메인
  beach:  `${BASE}/photo-1567115220168-93d296e55a0a`, // 푸꾸옥 에메랄드 라군
  resort: `${BASE}/photo-1605537964076-3cb0ea2ff329`, // 럭셔리 인피니티 풀
  city:   `${BASE}/photo-1510637844160-b5b7b335f369`, // 사이공 야경
};

// ─── 음식/레스토랑 ──────────────────────────────────────────────────
export const foodPhotos = {
  street:   `${BASE}/photo-1576021182211-9ea8dced3690`, // 베트남 길거리 음식
  pho:      `${BASE}/photo-1569050467447-ce54b3bbc37d`, // 퍼(Pho)
  seafood:  `${BASE}/photo-1559847844-5315695dadae`, // 해산물 요리
  banh:     `${BASE}/photo-1551218808-94e220e084d2`, // 반미
  market:   `${BASE}/photo-1528360983277-13d401cdc186`, // 재래시장 음식
};

// ─── 차량/이동 ───────────────────────────────────────────────────────
export const vehiclePhotos = {
  van:      `${BASE}/photo-1570125909232-eb263c188f7e`, // 관광 밴
  limousine:`${BASE}/photo-1489824904134-891ab64532f1`, // 리무진/고급 차량
  bus:      `${BASE}/photo-1544620347-c4fd4a3d5957`,    // 버스/셔틀
};

// ─── 가이드/투어 ─────────────────────────────────────────────────────
export const guidePhotos = {
  group:    `${BASE}/photo-1527631746610-bca00a040d60`, // 그룹 투어 가이드
  private:  `${BASE}/photo-1521737604893-d14cc237f11d`, // 프라이빗 가이드
  cultural: `${BASE}/photo-1503220317375-aaad61436b1b`, // 문화 투어
};

// ─── 공통 카테고리 (레거시 호환) ────────────────────────────────────
export const categoryPhotos = {
  hotel:      hotelPhotos.infinityPool,
  golf:       golfPhotos.tropical,
  spa:        spaPhotos.massage,
  tour:       `${BASE}/photo-1488085061387-422e29b40080`,
  beach:      vietnamPhotos.phuquoc,
  resort:     hotelPhotos.beachfront,
  culture:    vietnamPhotos.hoian,
  package:    vietnamPhotos.nhatrang,
  restaurant: foodPhotos.street,
  vehicle:    vehiclePhotos.van,
  guide:      guidePhotos.group,
};

/**
 * Unsplash 이미지 URL에 최적화 파라미터 추가
 */
export function optimizeUnsplash(
  baseUrl: string,
  width: number = 800,
  quality: number = 80
): string {
  return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

/**
 * 상품 타이틀·카테고리·위치를 분석해 가장 적합한 Unsplash URL 반환
 */
export function getSmartPhoto(opts: {
  title?: string;
  location?: string;
  category?: string;
  width?: number;
}): string {
  const { title = '', location = '', category = '', width = 800 } = opts;
  const text = `${title} ${location}`.toLowerCase();

  // 골프 상품: 지역별 다른 코스 사진
  if (category === 'golf') {
    if (text.includes('푸꾸옥')) return optimizeUnsplash(golfPhotos.tropical, width);
    if (text.includes('다낭'))   return optimizeUnsplash(golfPhotos.coastal, width);
    if (text.includes('하노이')) return optimizeUnsplash(golfPhotos.green, width);
    if (text.includes('나트랑')) return optimizeUnsplash(golfPhotos.links, width);
    if (text.includes('달랏'))   return optimizeUnsplash(golfPhotos.highland, width);
    return optimizeUnsplash(golfPhotos.tropical, width);
  }

  // 호텔/리조트 상품: 럭셔리 이미지
  if (category === 'hotel' || text.includes('리조트') || text.includes('호텔') || text.includes('패키지')) {
    if (text.includes('다낭') || text.includes('나트랑')) return optimizeUnsplash(hotelPhotos.beachfront, width);
    if (text.includes('푸꾸옥')) return optimizeUnsplash(hotelPhotos.overwater, width);
    return optimizeUnsplash(hotelPhotos.infinityPool, width);
  }

  // 스파 상품
  if (category === 'spa' || text.includes('스파') || text.includes('마사지') || text.includes('힐링')) {
    if (text.includes('스톤') || text.includes('핫스톤')) return optimizeUnsplash(spaPhotos.stone, width);
    if (text.includes('풀') || text.includes('온천')) return optimizeUnsplash(spaPhotos.pool, width);
    return optimizeUnsplash(spaPhotos.massage, width);
  }

  // 레스토랑/음식 상품
  if (category === 'restaurant' || text.includes('레스토랑') || text.includes('맛집') || text.includes('음식') || text.includes('푸드')) {
    if (text.includes('해산물') || text.includes('씨푸드')) return optimizeUnsplash(foodPhotos.seafood, width);
    if (text.includes('퍼') || text.includes('쌀국수')) return optimizeUnsplash(foodPhotos.pho, width);
    if (text.includes('반미') || text.includes('번미')) return optimizeUnsplash(foodPhotos.banh, width);
    if (text.includes('시장') || text.includes('야시장')) return optimizeUnsplash(foodPhotos.market, width);
    return optimizeUnsplash(foodPhotos.street, width);
  }

  // 차량/이동 상품
  if (category === 'vehicle' || text.includes('픽업') || text.includes('차량') || text.includes('셔틀') || text.includes('리무진')) {
    if (text.includes('리무진') || text.includes('고급')) return optimizeUnsplash(vehiclePhotos.limousine, width);
    if (text.includes('버스') || text.includes('셔틀')) return optimizeUnsplash(vehiclePhotos.bus, width);
    return optimizeUnsplash(vehiclePhotos.van, width);
  }

  // 가이드 상품
  if (category === 'guide' || text.includes('가이드') || text.includes('투어 가이드')) {
    if (text.includes('프라이빗') || text.includes('단독')) return optimizeUnsplash(guidePhotos.private, width);
    if (text.includes('문화') || text.includes('역사')) return optimizeUnsplash(guidePhotos.cultural, width);
    return optimizeUnsplash(guidePhotos.group, width);
  }

  // 투어: 지역별 대표 사진
  if (text.includes('하롱베이') || text.includes('크루즈')) return optimizeUnsplash(vietnamPhotos.halong, width);
  if (text.includes('호이안'))   return optimizeUnsplash(vietnamPhotos.hoian, width);
  if (text.includes('다낭'))     return optimizeUnsplash(vietnamPhotos.danang, width);
  if (text.includes('하노이'))   return optimizeUnsplash(vietnamPhotos.hanoi, width);
  if (text.includes('호치민'))   return optimizeUnsplash(vietnamPhotos.hochiminh, width);
  if (text.includes('나트랑'))   return optimizeUnsplash(vietnamPhotos.nhatrang, width);
  if (text.includes('푸꾸옥') || text.includes('아일랜드')) return optimizeUnsplash(vietnamPhotos.phuquoc, width);
  if (text.includes('달랏'))     return optimizeUnsplash(vietnamPhotos.dalat, width);
  if (text.includes('메콩'))     return optimizeUnsplash(vietnamPhotos.mekong, width);

  return optimizeUnsplash(categoryPhotos.tour, width);
}
