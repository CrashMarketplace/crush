import { useEffect } from "react";

/**
 * 페이지별 제목을 설정하는 커스텀 훅
 * @param title - 페이지 제목
 * @param description - 페이지 설명 (선택)
 */
export function usePageTitle(title: string, description?: string) {
  useEffect(() => {
    // 제목 설정
    document.title = `${title} | BILIDA`;

    // 설명이 제공되면 메타 태그 업데이트
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", description);
    }

    // 컴포넌트 언마운트 시 기본 제목으로 복원
    return () => {
      document.title = "BILIDA - 지역 기반 중고 거래 및 대여 플랫폼";
    };
  }, [title, description]);
}
