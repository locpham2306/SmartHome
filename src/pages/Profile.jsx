// FILE NÀY TẠO MÀN HỒ SƠ.
// ProfileSummary hiện tên/ảnh; ContactInformation hiện liên hệ.
// ResourceCard hiện một tài nguyên; ResourcesSection lặp để hiện tất cả tài nguyên.
// Profile ở cuối file ghép các phần thành một màn. Thông tin người dùng lấy từ API, không có ô nhập để sửa.

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import Icon from '../components/Icon';
import avatar from '../assets/avatar.png';

// Cấu hình bốn dòng tài nguyên: tên, mô tả, nhãn, icon và URL. href rỗng nghĩa là chưa có liên kết.
// Mỗi object: title là tên dòng, description là mô tả, tag là nhãn nhỏ, icon chọn hình/màu, href là đích mở.
// Muốn kích hoạt một tài nguyên chỉ cần điền href; không phải sửa cấu trúc JSX của ResourceCard.
const resources = [
  {
    title: 'Tài liệu hệ thống',
    description: 'Tổng quan và hướng dẫn sử dụng nhà thông minh',
    tag: 'PDF',
    icon: 'document',
    href: `${import.meta.env.BASE_URL}docs/bai-thuc-hanh-1-iot.pdf`,
  },
  {
    title: 'Tài liệu API',
    description: 'Mô tả API và hướng dẫn tích hợp',
    tag: 'API',
    icon: 'code',
    field: 'apiDocsLink',
  },
  {
    title: 'Kho mã GitHub',
    description: 'Mã nguồn và các tệp của dự án',
    tag: 'Mã nguồn',
    icon: 'branch',
    field: 'githubLink',
  },
  {
    title: 'Thiết kế Figma',
    description: 'Bố cục giao diện và thành phần thiết kế',
    tag: 'Thiết kế',
    icon: 'design',
    field: 'figmaLink',
  },
];

// Vẽ icon tài nguyên bằng SVG; currentColor nhận màu từ CSS theo loại tài nguyên.
function ResourceIcon({ type }) {
  // Các hình được mô tả bằng tọa độ SVG: path vẽ nét tự do, rect vẽ ô vuông, circle vẽ nút tròn.
  // Tất cả dùng chung viewBox 0 0 24 24 để đổi kích thước mà giữ tỉ lệ.
  const paths = {
    document: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),

    code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16" />,

    branch: (
      <>
        <circle cx="6" cy="5" r="3" />
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="5" r="3" />
        <path d="M6 8v8m12-8a8 8 0 0 1-8 8H6" />
      </>
    ),

    design: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <path d="M14 17.5h7m-3.5-3.5v7" />
      </>
    ),
  };

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

// Ảnh đại diện dùng tệp hiện có; họ tên lấy từ hồ sơ.
function ProfileSummary({ profile }) {
  return (
    <section className="profile-overview" aria-label="Thông tin hồ sơ">
      <div className="profile-identity">
        <img className="avatar" src={avatar} alt="Ảnh đại diện" />
        <div>
          <span className="profile-eyebrow">HỒ SƠ CÁ NHÂN</span>
          <h2>{profile.name || 'Chưa cập nhật tên'}</h2>
          <p>Sinh viên Học viện Công nghệ Bưu chính Viễn thông</p>
        </div>
      </div>
    </section>
  );
}

// Danh sách nhãn/giá trị liên hệ; mailto mở ứng dụng email, tel mở trình gọi điện nếu máy hỗ trợ.
function ContactInformation({ profile }) {
  return (
    <section className="profile-contact-card" aria-labelledby="contact-heading">
      <h3 id="contact-heading">
        <Icon name="profile" />
        Thông tin liên hệ
      </h3>
      {/* dl là danh sách mô tả: dt chứa nhãn (Mã sinh viên…), dd chứa giá trị tương ứng.
          CSS đặt nhãn và giá trị thành hai cột bên trong khối liên hệ một cột của trang. */}
      <dl className="profile-contact-list">
        <div>
          <dt>
            <Icon name="id" />
            Mã sinh viên
          </dt>
          <dd>{profile.studentId || 'Chưa cập nhật'}</dd>
        </div>
        <div>
          <dt>
            <Icon name="mail" />
            Thư điện tử
          </dt>
          <dd>
            {profile.email ? (
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            ) : 'Chưa cập nhật'}
          </dd>
        </div>
        <div>
          <dt>
            <Icon name="phone" />
            Điện thoại
          </dt>
          <dd>
            {profile.phone ? (
              <a href={`tel:${profile.phone}`}>{profile.phone}</a>
            ) : 'Chưa cập nhật'}
          </dd>
        </div>
      </dl>
    </section>
  );
}
// Một dòng tài nguyên: có href thì là liên kết mở tab mới; thiếu href thì là div và hiện ghi chú.
// tài nguyên 4 thẻ
function ResourceCard({ resource }) {
  // Có đường dẫn thì Tag="a" để bấm mở được. Chưa có đường dẫn thì Tag="div" để chỉ hiện nội dung.
  const Tag = resource.href ? 'a' : 'div';

  // Chỉ truyền thuộc tính link khi có URL. target=_blank mở tab mới; noopener chặn trang đích truy cập window.opener,
  // noreferrer không gửi referrer. Với href rỗng, spread object rỗng nên div không mang thuộc tính link.
  const linkProps = resource.href
    ? {
      href: resource.href,
      target: '_blank',
      rel: 'noopener noreferrer',
    }
    : {};

  return (
    <div className="profile-resource-cell">
      <Tag
        className={`profile-resource-card profile-resource-${resource.icon}`}
        {...linkProps}
      >
        {/* Các lớp Bootstrap d-flex/align-items-center/justify-content-center căn icon giữa ô; flex-shrink-0 giữ ô khỏi bị bóp. */}
        <span className="profile-resource-icon d-flex align-items-center justify-content-center rounded-3 flex-shrink-0">
          <ResourceIcon type={resource.icon} />
        </span>

        {/* flex-grow-1 cho phần nội dung nhận chiều rộng còn lại; hàng tiêu đề flex-wrap có thể xuống dòng khi thiếu chỗ. */}
        <div className="profile-resource-content flex-grow-1">
          <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
            <span className="fw-semibold">{resource.title}</span>

            <span className="profile-resource-badge badge rounded-pill">
              {resource.tag}
            </span>
            {/* Điều kiện thiếu URL chỉ vẽ ghi chú, không tạo liên kết giả có thể bấm. */}
            {!resource.href && (
              <small className="profile-resource-note">Chưa có liên kết</small>
            )}
          </div>

          <small className="text-secondary d-block">
            {resource.description}
          </small>
        </div>

        {/* Chỉ tài nguyên mở được mới có mũi tên ↗; aria-hidden vì mũi tên chỉ mang ý nghĩa trang trí. */}
        {resource.href && (
          <span aria-hidden="true" className="text-primary">
            ↗
          </span>
        )}
      </Tag>
    </div>
  );
}

//lặp mảng để hiện tài nguyên
function ResourcesSection({ profile }) {
  return (
    <section
      aria-labelledby="resources-heading"
      className="profile-resources-card"
    >
      <h3 id="resources-heading" className="profile-section-title">
        <Icon name="fields" />
        Tài liệu &amp; Tài nguyên
      </h3>

      <p className="profile-section-description">
        Tài liệu và mã nguồn của dự án nhà thông minh.
      </p>

      <div className="profile-resource-grid">
        {/* Duyệt đúng thứ tự khai báo; title dùng làm key nên các tiêu đề tài nguyên cần khác nhau. */}
        {/* lặp map để hiện tài nguyên. */}
        {resources.map((resource) => (
          <ResourceCard key={resource.title} resource={{
            ...resource,
            href: resource.field ? safeResourceUrl(profile[resource.field]) : resource.href,
          }} />
        ))}
      </div>
    </section>
  );
}

// Ba khối xếp dọc trong một cột; profile.css phân bổ chiều cao theo viewport, không tạo cuộn trang.
// Chỉ mở liên kết web hợp lệ từ dữ liệu hồ sơ.
function safeResourceUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    let timedOut = false;
    setProfile(null);
    setError('');
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 10000);

    apiRequest('/api/profile/1', { signal: controller.signal })
      .then((data) => {
        if (!data || data.id !== 1) throw new Error('Dữ liệu hồ sơ không hợp lệ.');
        if (!disposed) setProfile(data);
      })
      .catch((err) => {
        if (disposed) return;
        setError(timedOut ? 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.' : err.message);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      disposed = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  if (!profile) {
    return (
      <div className="profile-page">
        <section className="profile-overview" aria-busy={!error}>
          {error ? (
            <>
              <p role="alert" className="text-danger">{error}</p>
              <button className="btn btn-outline-primary btn-sm" onClick={() => {
                setError('');
                setAttempt((value) => value + 1);
              }}>Thử lại</button>
            </>
          ) : <p role="status">Đang tải hồ sơ…</p>}
        </section>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <ProfileSummary profile={profile} />
      <ContactInformation profile={profile} />
      <ResourcesSection profile={profile} />
    </div>
  );
}
