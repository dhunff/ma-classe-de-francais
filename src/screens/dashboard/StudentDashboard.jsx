import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle, Target, Clock, PartyPopper, AlertTriangle, Inbox,
  UserCircle, ChevronRight, ArrowRight, } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { Card, StatTile, EmptyState, HeroBanner, Rise, Ring } from "./parts.jsx";
import { usePracticeStore, usePracticeHistory } from "./PracticeRail.jsx";
import {
  studentWorkload, averageScore, skillBreakdown, nextUp, isLate, exSkills, fmtDate,
} from "../../shared/exercises.js";
import { calculateProfileCompletion } from "../../shared/profile.js";
import StreakWidget from "./StreakWidget.jsx";
import FollowingStreakWidget from "./FollowingStreakWidget.jsx";
import GioHocWidget from "./GioHocWidget.jsx";
import KeHoachThi from "./KeHoachThi.jsx";
import LichSapToi from "./LichSapToi.jsx";
import TourGioiThieu from "../../shared/TourGioiThieu.jsx";
import { DeXuatBai, TroChoi, DeXuatTroChoi, DongDeuKyNang, chonDeXuat } from "./TrangChuKhoi.jsx";

/* Trang chủ học sinh.

   Nguyên tắc không đổi: mỗi con số ở đây phải tính được từ dữ liệu thật.
   Thứ nào chưa có nguồn thì hiện trạng thái rỗng nói rõ lý do — tuyệt đối
   không dựng số minh hoạ, vì học sinh sẽ tin vào nó.

   "Chuỗi ngày học" từng là ví dụ của diện đó suốt nhiều tháng. Nay nó có
   nguồn thật: bảng `daily_activity` (migration 061), ghi mỗi khi máy chủ
   chấm xong một bài. Trạng thái rỗng vẫn còn — nhưng giờ nó nghĩa là "chưa
   học ngày nào", chứ không phải "hệ thống không biết".

   Bố cục hai cột, không phải ba: cột điều hướng bên trái đã do AppLayout cấp.
   Dựng thêm một sidebar nữa trong đây là lặp lại đúng thứ vừa được gỡ bỏ.

   Hoạt ảnh xuất hiện xếp so le qua <Rise delay>. Mọi hoạt ảnh đều tự tắt khi
   người dùng bật giảm chuyển động — xem base.css. */

/* `practice` và `practiceHistory` chỉ để preview.jsx bơm fixture vào; lúc
   chạy thật bỏ trống và các khối tự nạp từ kho. */
export default function StudentDashboard({
  name, exercises, submissions, profile, t, onOpen, practice, practiceHistory, chuoiFixture, theoDoiFixture, bxhFixture, gioHocFixture,
}) {
  const navigate = useNavigate();
  const { assigned, done, todo } = studentWorkload(exercises, submissions, name);
  const avg = averageScore(exercises, submissions, name);
  /* Biểu đồ kỹ năng đọc cả kho luyện tập: bài được giao thường rất ít, mà
     học sinh lại làm nhiều bài tự luyện — chỉ đếm bài được giao thì biểu đồ
     trống trơn trong khi người đó đã làm cả chục bài. */
  const practiceStore = usePracticeStore(practice);
  const practiceHist = usePracticeHistory(name, practiceHistory);
  const skills = skillBreakdown(
    exercises, submissions, name, practiceStore || [], practiceHist || {},
  );
  const upcoming = nextUp(exercises, submissions, name, 4);
  const overdue = todo.filter((ex) => isLate(ex)).length;
  const goal = profile?.goal || "";
  const profilePct = calculateProfileCompletion(profile);
  const donePct = assigned.length ? Math.round((done.length / assigned.length) * 100) : 0;

  /* Chuỗi ngày học. BA trạng thái, không phải hai:
       undefined → chưa hỏi xong
       null      → hỏi rồi, KHÔNG đọc được (mạng, chưa đăng nhập)
       số        → câu trả lời thật, kể cả 0
     Gộp "không đọc được" với "0 ngày" là nói với người vừa học ba ngày liền
     rằng họ chưa học buổi nào. */
  /* Chuỗi ngày giờ nằm trong StreakWidget (tính ở máy chủ từ attempts). */
  const chuoi = chuoiFixture;

  return (
    /* Nền chuyển sắc rất nhạt để thẻ nền mờ có thứ để mờ lên trên. Bản tối
       dùng token nên ăn theo nền chung của app, không phải đen thuần. */
    /* Nền tràn viền đã bỏ — tấm thẻ nội dung của AppLayout cấp nền rồi. */
    <div className="pt-2">
      {/* Tour trang chủ (27/09) — một lần mỗi trình duyệt; « Xem lại hướng dẫn »
          trong menu ảnh đại diện mở lại. Bỏ qua ở trang xem thử khi có fixture. */}
      <TourGioiThieu khoa="hasSeenTrangChuTour" choXong="hasSeenGiaoDienTour" steps={[
        { target: "#tour-tc-chuoi", title: t("tour.tc2_title"), content: t("tour.tc2_body"), placement: "left" },
        { target: "#tour-tc-theo-doi", title: t("tour.tc3_title"), content: t("tour.tc3_body"), placement: "left" },
        { target: "#tour-tc-gio-hoc", title: t("tour.tc4_title"), content: t("tour.tc4_body"), placement: "left" },
        { target: "#tour-tc-ky-nang", title: t("tour.tc5_title"), content: t("tour.tc5_body"), placement: "top" },
      ]} />
      <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-[1fr_340px]">

        {/* ─────────────── Cột chính ───────────────
            `min-w-0` là bắt buộc từ khi có băng chuyền: flex/grid item mặc
            định `min-width: auto`, nên cột sẽ nong ra bằng tổng bề rộng thẻ
            thay vì để khung con tự cuộn — kéo tràn ngang cả trang. */}
        <div className="flex min-w-0 flex-col gap-4">

          {/* Cùng banner với trang chủ chung — đăng nhập rồi đi qua hai màn
              hình phải thấy một sản phẩm, không phải hai.

              Khối chào cũ đã bỏ: hai con số của nó (đã nộp / điểm trung bình)
              lặp y nguyên ở hàng ô số liệu ngay bên dưới, chỉ riêng "Mục tiêu"
              là không lặp nên được mang vào banner. */}
          <Rise delay={0}>
            <HeroBanner t={t} signedIn name={name} as="h2" goal={goal} level={profile?.level}
              hocTiep="/etudiant/entrainement" nut={false} note={goal ? null : t("dash.no_goal")} />
          </Rise>

          {/* 26/10 (chủ dự án): Trò chơi & thử thách lên đầu, ngay dưới banner. */}
          <Rise delay={60}>
            <TroChoi />
          </Rise>
          <Rise delay={90}>
            <DeXuatTroChoi />
          </Rise>


          {/* 27/10 (chủ dự án: « rối mắt »): gom thành hai nhóm có tiêu đề.
              « Việc hôm nay » = kế hoạch thi + bài luyện + học tiếp ngữ pháp;
              « Gợi ý cho bạn » = bài đề xuất. Hồ sơ chưa đầy nằm cuối, không chen giữa. */}
          <section className="mt-2">
            <h2 className="m-0 mb-3 text-lg font-extrabold text-ink">{tr("Việc hôm nay", "Aujourd'hui", "Today")}</h2>
            <div className="flex flex-col gap-4">
            {/* 08/10: trang chủ là ĐỀ XUẤT + TRÒ CHƠI. Ô Đã nộp / Điểm TB / Đang chờ
                làm / % hoàn thành / Học tiếp đã sang trang « Bài tập được giao »
                (TongQuanBaiGiao.jsx). */}
            {/* 23/10: kế hoạch tới ngày thi (migration 160). Không đăng nhập thì không có. */}
            {chuoiFixture === undefined && (
              <Rise delay={140}>
                <KeHoachThi capGoiY={(profile?.goal || "").match(/A1|A2|B1|B2|C1/)?.[0]} />
              </Rise>
            )}
              <Rise delay={150}>
              {/* 27/10: thẻ trắng thay dải gradient hồng (bớt một khối màu đậm tranh chỗ). */}
              <Link to="/etudiant/bai-luyen"
                className="group flex items-center gap-4 rounded-3xl bg-surface p-4 no-underline shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.985]">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-violet-600 text-white"><Target size={22} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold text-ink">{tr("Bài luyện của tôi", "Mon entraînement perso", "My practice set")}</span>
                  <span className="block text-sm text-soft">{tr("10 câu ghép từ chính những câu bạn từng làm sai", "10 questions tirées de vos propres erreurs", "10 questions built from your own mistakes")}</span>
                </span>
                <ArrowRight size={20} className="shrink-0 text-soft transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
              </Rise>
            {/* Thẻ « Học ngữ pháp » (TienDoNguPhap) gỡ 28/10 theo chủ dự án; hàm vẫn ở TrangChuKhoi.jsx. */}
            {/* 28/10: đặt lịch học ngay ở trang chủ, mail Léon nhắc trước 30 phút (migration 172). */}
            {chuoiFixture === undefined && <Rise delay={190}><LichSapToi /></Rise>}
              </div>
          </section>

          <section className="mt-2">
            <Rise delay={160}>
              <DeXuatBai coHoSo={!!(profile?.level && profile?.goal)} level={profile?.level} goal={profile?.goal}
                dsDeXuat={practiceStore ? chonDeXuat({ practice: practiceStore, hist: practiceHist, skills, level: profile?.level, goal: profile?.goal }) : null}
                onMo={(ex) => navigate("/etudiant/entrainement", { state: { moBai: ex.id } })} />
            </Rise>
  
            </section>

          {/* Hồ sơ chưa đầy thì mời điền. Đầy rồi thì biến mất — một thanh
              đứng mãi ở 100% không còn nói điều gì. */}
          {profilePct < 100 && (
            <Rise delay={80}>
              <Link to="/etudiant/compte"
                className="group flex items-center gap-4 rounded-3xl bg-surface/80 p-5 no-underline shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-[0.985]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <UserCircle size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-sm font-bold text-ink">{t("dash.profile_completion", { pct: profilePct })}</p>
                  <p className="m-0 mt-0.5 text-xs text-soft">{t("dash.profile_hint")}</p>
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
                    <div className="h-full w-full rounded-full bg-primary transition-transform duration-[550ms] ease-out"
                      style={{ transform: `translateX(${profilePct - 100}%)` }} />
                  </div>
                </div>
                <ChevronRight size={18} className="shrink-0 text-soft transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </Rise>
          )}



          {/* 26/10 (chủ dự án): bỏ băng « Mới ra · Luyện tập »; bài mới trong 30 ngày
              mang nhãn « Mới » ngay trên thẻ bài ở thư viện (ExerciseCard). */}
        </div>

        {/* ─────────────── Cột phải ─────────────── */}
        <div className="flex flex-col gap-4">

          <Rise id="tour-tc-chuoi" delay={80}>
            <StreakWidget t={t} fixture={chuoi} />
          </Rise>

          <Rise id="tour-tc-gio-hoc" delay={110}>
            <Card title={t("home.hours_title")}>
              <GioHocWidget t={t} fixture={gioHocFixture} />
            </Card>
          </Rise>

          {/* 23/10 (theo chủ dự án): ô nhỏ ở cột phải, cạnh Giờ học. */}
          <Rise id="tour-tc-ky-nang" delay={130}>
            <DongDeuKyNang gon skills={skills}
              ghiChu={skills.sources?.assigned && skills.sources?.practice ? t("dash.skills_note_both")
                : skills.sources?.practice ? t("dash.skills_note_practice") : t("dash.skills_note")} />
          </Rise>

          <Rise id="tour-tc-theo-doi" delay={100}>
            <FollowingStreakWidget t={t} fixture={theoDoiFixture} bxhFixture={bxhFixture} />
          </Rise>

        </div>
      </div>
    </div>
  );
}
