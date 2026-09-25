import { useEffect, useState } from "react";
import { supabase } from "../storageShim.js";

/* Tìm kiếm chung — RPC `global_search` (migration 097, SECURITY INVOKER nên
 * RLS áp nguyên vẹn: học sinh không bao giờ nhận được hồ sơ người khác).
 *
 * Chờ 300ms sau lần gõ cuối mới gọi, và BỎ kết quả của lượt gọi cũ nếu người
 * dùng đã gõ tiếp: mạng trả về không theo thứ tự gửi, nên thiếu cờ `con` thì
 * kết quả của "pa" có thể về SAU và đè lên kết quả của "passé".
 *
 * Dưới 2 ký tự thì không gọi — máy chủ cũng trả rỗng, gọi chỉ tốn một vòng. */
const RONG = { exercises: [], students: [] };

export function useGlobalSearch(query, { bat = true, tre = 300 } = {}) {
  const [data, setData] = useState(RONG);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tu = (query || "").trim();
    if (!bat || tu.length < 2) {
      setData(RONG); setIsLoading(false); setError(null);
      return;
    }
    let con = true;
    setIsLoading(true);
    const hen = setTimeout(async () => {
      const { data: kq, error: loi } = await supabase.rpc("global_search", { search_term: tu });
      if (!con) return;
      setIsLoading(false);
      if (loi) { setError(loi.message || "loi"); setData(RONG); return; }
      setError(null);
      setData({ exercises: kq?.exercises ?? [], students: kq?.students ?? [] });
    }, tre);
    return () => { con = false; clearTimeout(hen); };
  }, [query, bat, tre]);

  return { data, isLoading, error };
}
