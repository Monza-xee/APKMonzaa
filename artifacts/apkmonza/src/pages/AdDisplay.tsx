import { useEffect } from "react";

export function AdDisplay() {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-8225681298085932"
      data-ad-slot="9757313974"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
