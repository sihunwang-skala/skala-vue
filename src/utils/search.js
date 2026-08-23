// 한글 초성 검색 + 영문 이름 검색을 지원하는 검색 매칭 유틸
const CHOSUNG_LIST = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('')

function toChosung(str) {
  return [...str]
    .map((char) => {
      const code = char.charCodeAt(0) - 0xac00
      if (code < 0 || code > 11171) return char
      return CHOSUNG_LIST[Math.floor(code / 588)]
    })
    .join('')
}

function isChosungOnly(str) {
  return /^[ㄱ-ㅎ]+$/.test(str)
}

// item.name(한글) / item.nameEn(영문)을 검색어와 비교한다.
// 일반 포함 검색, 초성 검색("ㅅㅇ" → "서울"), 영문 검색을 모두 지원한다.
export function matchesSearch(item, rawQuery) {
  const query = rawQuery.trim()
  if (!query) return true

  if (item.name.includes(query)) return true
  if (item.nameEn && item.nameEn.toLowerCase().includes(query.toLowerCase())) return true
  if (isChosungOnly(query) && toChosung(item.name).includes(query)) return true

  return false
}
