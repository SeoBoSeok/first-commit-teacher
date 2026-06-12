import GalleryClient from "./GalleryClient";

// 3D NFT 전시관 — 메타버스 갤러리 (참고: uwemaurer/nft-metaverse 의 "벽에 걸린 NFT를 걸어다니며 보기")
// Web3 로그인·IPFS는 범위 밖 — 읽기 전용 쇼케이스 원칙 (docs/01-PRD)
export const metadata = { title: "3D Gallery — SpaceKkabbi Metaverse" };

export default function GalleryPage() {
  return <GalleryClient />;
}
